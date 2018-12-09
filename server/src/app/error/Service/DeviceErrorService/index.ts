"use strict";
import {Request} from 'express';
import * as validator from 'validator';
import {ValidationService} from "../../../system/ValidationService";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import ValidationHelper from "../../../system/ValidationHelper";
import User from "../../../user/Domain/Entity/User/index";
import DeviceErrorDao from "../../Domain/Dao/DeviceErrorDao/index";
import UserService from "../../../user/Service/UserService/index";
import {CRUDDao} from "../../../system/CRUDDao";
import DeviceError from '../../Domain/Dao/Entity/DeviceError/index';

export interface DeviceErrorModel {
    id?: number;
    user?: User;
    osName: string;
    osVersion: string;
    message: string;
    className?: string;
}

export interface DeviceErrorModelValidation {
    valid: boolean,
}

export default class DeviceErrorService implements ValidationService<DeviceErrorModel> {

    private deviceErrorDao: DeviceErrorDao;
    private userService: UserService;

    constructor(services: Map<string, any>, daos: Map<string, CRUDDao<any>>) {
        this.deviceErrorDao = <DeviceErrorDao>daos.get('deviceErrorDao');
        this.userService = services.get('userService');
    }

    save(errorDeviceModel: DeviceErrorModel): Promise<DeviceError> {
        return this.deviceErrorDao.saveWithConnection({
            model: errorDeviceModel,
            onNewEntity:    (entity, model) => {},
            onUpdateEntity: (entity, model)=> {
                entity.user = model.user;
                entity.osName = model.osName;
                entity.osVersion = model.osVersion;
                entity.message = model.message;
                entity.className = model.className;
            }
        });
    }

    createModel(request: Request & RequestWithLocale): Promise<DeviceErrorModel> {
        return new Promise((resolve, reject) => {
            let content: any = request.body;
            let model: DeviceErrorModel = {
                id: content.id || undefined,
                osName: content.os || '',
                osVersion: content.version || '',
                message: content.message || '',
                className: content.className || '',
                user: null,
            };

            if (request.user) {
                this.userService.getById(request.user.id)
                    .then(
                        (user) => {
                            model.user = user;
                            resolve(model);
                        },
                        reject
                    )
                    .catch(reject);
            } else {
                resolve(model);
            }
        });
    }

    validate(model: DeviceErrorModel, request: Request & RequestWithLocale): Promise<DeviceErrorModelValidation> {
        return new Promise((resolve, reject) => {
            let validation: DeviceErrorModelValidation = {
                valid: true
            };

            //validation.valid = ValidationHelper.isValid(validation);

            resolve(validation);
        });
    }
}