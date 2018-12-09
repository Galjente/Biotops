"use strict";
import {Application, Router, Request, Response, NextFunction} from "express";
import {Controller} from "../../../system/Controller";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import UserService from "../../../user/Service/UserService";
import DeviceErrorService from "../../Service/DeviceErrorService/index";
import * as winston from "winston";

export default class ErrorApiController implements Controller {

    private userService: UserService;
    private deviceErrorService: DeviceErrorService;

    constructor(services: Map<string, any>) {
        this.userService = services.get('userService');
        this.deviceErrorService = services.get('deviceErrorService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.post('/api/device/error',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.saveDeviceError(request, response)});
    }

    postInitialization(): void {}

    saveDeviceError(request: Request & RequestWithLocale, response: Response) {
        this.deviceErrorService.createModel(request)
            .then(
                (model) => {
                    this.deviceErrorService.validate(model, request)
                        .then(
                            (validation) => {
                                if (validation.valid) {
                                    this.deviceErrorService.save(model)
                                        .then(
                                            (deviceError) => {
                                                response.status(200).json(deviceError);
                                            },
                                            (error) => {
                                                winston.error('Failed save device error', error);
                                                response.status(500).json();
                                            }
                                        ).catch((error) => {
                                            winston.error('Failed save device error', error);
                                            response.status(500).json();
                                        });
                                } else {
                                    response.status(400).json();
                                }
                            },
                            (error) => {
                                winston.error('Failed validate device error model', error);
                                response.status(500).json();
                            }
                        )
                        .catch((error) => {
                            winston.error('Failed validate device error model', error);
                            response.status(500).json();
                        });
                },
                (error) => {
                    winston.error('Failed create device error model', error);
                    response.status(500).json();
                }
            ).catch((error) => {
                winston.error('Failed create device error model', error);
                response.status(500).json();
            });
    }

}