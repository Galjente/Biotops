"use strict";
import {Application, Router, Request, Response, NextFunction} from "express";
import {Controller} from "../../../system/Controller";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import UserService from "../../../user/Service/UserService/index";
import PlaceCategoryService from "../../Service/PlaceCategoryService/index";
import Image from "../../../storage/Domain/Entity/Image/index";

export default class PlaceCategoryAPIController implements Controller {

    private userService: UserService;
    private placeCategoryService:PlaceCategoryService;

    constructor(services: Map<string, any>) {
        this.userService = services.get('userService');
        this.placeCategoryService = services.get('placeCategoryService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/api/place/category/all',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getAllPlaceCategories(request, response);});
    }

    postInitialization(): void {}

    getAllPlaceCategories(request: Request & RequestWithLocale, response: Response): void {
        this.placeCategoryService.getAllPublished()
            .then(
                (placeCategories) => {
                    let apiCategories: Array<any> = placeCategories
                        .filter((category)=> {
                            return category.icon != null;
                        }).map(
                        (category) => {
                            return {
                                id: category.id,
                                name: category.name,
                                uri: (<Image>category.icon).uri,
                            };
                        }
                    );
                    response.status(200).json(apiCategories);
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

}