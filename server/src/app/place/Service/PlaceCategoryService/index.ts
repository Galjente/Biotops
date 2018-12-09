"use strict";
import {Request} from 'express';
import * as winston from "winston";
import * as validator from 'validator';
import {ModelValidation, ValidationService} from "../../../system/ValidationService";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import {CRUDDao, SearchOption} from "../../../system/CRUDDao";
import PlaceCategoryDao from "../../Domain/Dao/PlaceCategoryDao";
import PlaceCategory from "../../Domain/Entity/PlaceCategory";
import Image from "../../../storage/Domain/Entity/Image";
import StorageService from "../../../storage/Service/StorageService";
import ValidationHelper from "../../../system/ValidationHelper";

export interface PlaceCategoryModel {
    id?: number;
    name: string;
    icon?: Image;
    published: boolean;
}

export interface PlaceCategoryModelValidation extends ModelValidation {
    id?: string;
    name?: string;
    published?: string;
}

export default class PlaceCategoryService implements ValidationService<PlaceCategoryModel> {

    private placeCategoryDao: PlaceCategoryDao;
    private storageService: StorageService;

    constructor(services: Map<string, any>, daos: Map<string, CRUDDao<any>>) {
        this.placeCategoryDao = <PlaceCategoryDao>daos.get('placeCategoryDao');
        this.storageService = services.get('storageService');
    }

    save(placeCategoryModel: PlaceCategoryModel): Promise<PlaceCategory> {
        return this.placeCategoryDao.saveWithConnection({
            model: placeCategoryModel,
            onNewEntity:    (entity, model) => {},
            onUpdateEntity: (entity, model) => {
                entity.name = model.name;
                entity.icon = model.icon;
                entity.published = model.published;
            }
        });
    }

    getAll():Promise<Array<PlaceCategory>> {
        let criteria:Map<string, any> = new Map();
        criteria.set('deleted', false);
        return this.placeCategoryDao.findAllByCriteriaWithConnection(criteria)
    }

    getAllPublished():Promise<Array<PlaceCategory>> {
        let criteria:Map<string, any> = new Map();
        criteria.set('deleted', false);
        criteria.set('published', true);
        return this.placeCategoryDao.findAllByCriteriaWithConnection(criteria);
    }

    getPage(page: number, perPage: number): Promise<RestPage<PlaceCategory>> {
        let criteria:Map<string, any> = new Map();
        criteria.set('deleted', false);
        return this.placeCategoryDao.findPageByCriteriaWithConnection(criteria, page, perPage);
    }

    getPlaceCategory(id:number): Promise<PlaceCategory> {
        return this.placeCategoryDao.findByIdWithConnection(id);
    }

    getByIds(ids: Array<number>):Promise<Array<PlaceCategory>> {
        return this.placeCategoryDao.findAllInWithConnection(ids);
    }

    getById(id: number):Promise<PlaceCategory> {
        return this.placeCategoryDao.findByIdWithConnection(id);
    }

    delete(id: number): Promise<PlaceCategory> {
        return new Promise((resolve, reject) => {
            this.placeCategoryDao.findByIdWithConnection(id)
                .then(
                    (placeCategory) => {
                        if (!placeCategory || placeCategory.deleted) {
                            resolve(null);
                            return;
                        }
                        placeCategory.deleted = true;

                        this.placeCategoryDao.saveEntityWithConnection(placeCategory)
                            .then(resolve, reject)
                            .catch(reject)
                    },
                    reject
                )
                .catch(reject);
        });
    }

    createModel(request: Request & RequestWithLocale): Promise<PlaceCategoryModel> {
        return new Promise((resolve, reject) => {
            let content: any = request.body;

            let placeCategoryModel: PlaceCategoryModel = {
                id: content.id || undefined,
                name: content.name || '',
                published: content.published === 'on'
            };

            if (content.iconId && !isNaN(content.iconId)) {
                winston.debug(`Fetching icon(${content.iconId}) for PlaceCategoryModel`);
                this.storageService.getImage(content.iconId)
                    .then(
                        (image) => {
                            placeCategoryModel.icon = image;
                            resolve(placeCategoryModel);
                        },
                        (error) => {
                            winston.error('Failed load icon for place category', error);
                            resolve(placeCategoryModel);
                        }
                    )
                    .catch((error) => {
                        winston.error('Failed load icon for place category', error);
                        resolve(placeCategoryModel);
                    });
            } else {
                resolve(placeCategoryModel);
            }
        });
    }

    validate(model: PlaceCategoryModel, request: Request & RequestWithLocale): Promise<PlaceCategoryModelValidation> {
        return new Promise((resolve, reject) => {
            let validation: PlaceCategoryModelValidation = {
                valid: true
            };

            validation.name = validator.isLength(model.name, {min: 2, max: 255}) ? undefined : 'Name length should be between 2 and 255 symbols';
            validation.id = model.id ? (isNaN(model.id) ? 'Unique number is incorrect please refresh page and try again later' : undefined) : undefined;
            validation.published = model.published && !model.icon ? 'You can\'t publish place category without icon' : undefined;

            validation.valid = ValidationHelper.isValid(validation);

            resolve(validation);
        });
    }
}