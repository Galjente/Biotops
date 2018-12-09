"use strict";
import {Request} from 'express';
import * as validator from 'validator';
import {ModelValidation, ValidationService} from "../../../system/ValidationService";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import {CRUDDao} from "../../../system/CRUDDao";
import Badge from "../../Domain/Entity/Badge";
import BadgeDao, {BadgeWithAchievementStatus} from "../../Domain/DAO/BadgeDao";
import User from "../../../user/Domain/Entity/User";
import Image from "../../../storage/Domain/Entity/Image";
import StorageService from "../../../storage/Service/StorageService/index";
import ValidationHelper from "../../../system/ValidationHelper";

export interface BadgeModel {
    id?: number;
    name: string;
    congratulationText: string;
    aimText: string;
    imageActivate?: Image;
    imageDeactivate?: Image;
    published: boolean;
}

export interface BadgeModelValidation extends ModelValidation {
    id?: string;
    name?: string;
    congratulationText?: string;
    aimText?: string;
    published?: string;
}

export interface ApiBadgeModel {
    name: string;
    description: string;
    achieved: boolean;
    imageUrl?: string;
}

export default class BadgeService implements ValidationService<BadgeModel> {

    private badgeDao: BadgeDao;
    private storageService: StorageService;

    constructor(services: Map<string, any>, daos: Map<string, CRUDDao<any>>) {
        this.badgeDao = <BadgeDao>daos.get('badgeDao');
        this.storageService = services.get('storageService');
    }

    save(badgeModel: BadgeModel): Promise<Badge> {
        return this.badgeDao.saveWithConnection({
            model: badgeModel,
            onNewEntity:    (entity, model) => {},
            onUpdateEntity: (entity, model)=> {
                entity.name = model.name;
                entity.congratulationText = model.congratulationText;
                entity.imageActivate = model.imageActivate;
                entity.imageDeactivate = model.imageDeactivate;
                entity.published = model.published;
                entity.aimText = model.aimText;
            }
        });
    }

    getPage(page: number, perPage: number): Promise<RestPage<Badge>> {
        let criteria: Map<string, any> = new Map();
        criteria.set('deleted', false);
        return this.badgeDao.findPageByCriteriaWithConnection(criteria, page, perPage);
    }

    getBadge(id:number): Promise<Badge> {
        return this.badgeDao.findByIdWithConnection(id);
    }

    getAllBadgesWithAchievementStatusForUser(userId: number): Promise<Array<BadgeWithAchievementStatus>> {
        return this.badgeDao.findAllWithAchievementStatus(userId);
    }

    deleteBadge(id:number):Promise<Badge> {
        return new Promise((resolve, reject) => {
            this.getBadge(id)
                .then(
                    (badge) => {
                        if (!badge || badge.deleted) {
                            resolve(null);
                            return;
                        }
                        badge.deleted = true;
                        this.badgeDao.saveEntityWithConnection(badge)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    getLatestBadge(user: User):Promise<Badge> {
        return this.badgeDao.findLatestAchivedBadge(user.id);
    }

    createModel(request: Request & RequestWithLocale): Promise<BadgeModel> {
        return new Promise((resolve, reject) => {
            let content: any = request.body;
            let badgeModel:BadgeModel = {
                id: content.id || undefined,
                name: content.name || '',
                congratulationText: content.congratulationText || '',
                aimText: content.aimText || '',
                published: content.published == 'on'
            };

            let promises: Array<Promise<Image>> = Array();

            promises.push(new Promise((resolve2, reject2) => {
                this.storageService.getImage(content.imageActivateId)
                    .then(
                        (image) => {
                            badgeModel.imageActivate = image;
                            resolve2();
                        },
                        reject2
                    )
                    .catch(reject2);
            }));

            promises.push(new Promise((resolve2, reject2) => {
                this.storageService.getImage(content.imageDeactivateId)
                    .then(
                        (image) => {
                            badgeModel.imageDeactivate = image;
                            resolve2();
                        },
                        reject2
                    )
                    .catch(reject2);
            }));

            Promise.all(promises)
                .then(
                    () => {
                        resolve(badgeModel);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    validate(model: BadgeModel, request: Request & RequestWithLocale): Promise<BadgeModelValidation> {
        return new Promise((resolve, reject) => {
            let validation: BadgeModelValidation = {
                valid: true
            };

            validation.name = validator.isLength(model.name, {min: 2, max: 255}) ? undefined : 'Badge name length must be between 2 and 255 symbols';
            validation.congratulationText = validator.isLength(model.congratulationText, {min: 5}) ? undefined : 'Congratulation text must be at leas 5 symbols';
            validation.aimText = validator.isLength(model.aimText, {min: 5}) ? undefined : 'AIM text must be at leas 5 symbols';
            validation.published = model.published && (!model.imageActivate || !model.imageDeactivate) ? 'You can\'t publish without badge images' : undefined;
            validation.valid = ValidationHelper.isValid(validation);

            resolve(validation);
        });
    }
}