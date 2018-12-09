"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const validator = require("validator");
const ValidationHelper_1 = require("../../../system/ValidationHelper");
class PlaceCategoryService {
    constructor(services, daos) {
        this.placeCategoryDao = daos.get('placeCategoryDao');
        this.storageService = services.get('storageService');
    }
    save(placeCategoryModel) {
        return this.placeCategoryDao.saveWithConnection({
            model: placeCategoryModel,
            onNewEntity: (entity, model) => { },
            onUpdateEntity: (entity, model) => {
                entity.name = model.name;
                entity.icon = model.icon;
                entity.published = model.published;
            }
        });
    }
    getAll() {
        let criteria = new Map();
        criteria.set('deleted', false);
        return this.placeCategoryDao.findAllByCriteriaWithConnection(criteria);
    }
    getAllPublished() {
        let criteria = new Map();
        criteria.set('deleted', false);
        criteria.set('published', true);
        return this.placeCategoryDao.findAllByCriteriaWithConnection(criteria);
    }
    getPage(page, perPage) {
        let criteria = new Map();
        criteria.set('deleted', false);
        return this.placeCategoryDao.findPageByCriteriaWithConnection(criteria, page, perPage);
    }
    getPlaceCategory(id) {
        return this.placeCategoryDao.findByIdWithConnection(id);
    }
    getByIds(ids) {
        return this.placeCategoryDao.findAllInWithConnection(ids);
    }
    getById(id) {
        return this.placeCategoryDao.findByIdWithConnection(id);
    }
    delete(id) {
        return new Promise((resolve, reject) => {
            this.placeCategoryDao.findByIdWithConnection(id)
                .then((placeCategory) => {
                if (!placeCategory || placeCategory.deleted) {
                    resolve(null);
                    return;
                }
                placeCategory.deleted = true;
                this.placeCategoryDao.saveEntityWithConnection(placeCategory)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    createModel(request) {
        return new Promise((resolve, reject) => {
            let content = request.body;
            let placeCategoryModel = {
                id: content.id || undefined,
                name: content.name || '',
                published: content.published === 'on'
            };
            if (content.iconId && !isNaN(content.iconId)) {
                winston.debug(`Fetching icon(${content.iconId}) for PlaceCategoryModel`);
                this.storageService.getImage(content.iconId)
                    .then((image) => {
                    placeCategoryModel.icon = image;
                    resolve(placeCategoryModel);
                }, (error) => {
                    winston.error('Failed load icon for place category', error);
                    resolve(placeCategoryModel);
                })
                    .catch((error) => {
                    winston.error('Failed load icon for place category', error);
                    resolve(placeCategoryModel);
                });
            }
            else {
                resolve(placeCategoryModel);
            }
        });
    }
    validate(model, request) {
        return new Promise((resolve, reject) => {
            let validation = {
                valid: true
            };
            validation.name = validator.isLength(model.name, { min: 2, max: 255 }) ? undefined : 'Name length should be between 2 and 255 symbols';
            validation.id = model.id ? (isNaN(model.id) ? 'Unique number is incorrect please refresh page and try again later' : undefined) : undefined;
            validation.published = model.published && !model.icon ? 'You can\'t publish place category without icon' : undefined;
            validation.valid = ValidationHelper_1.default.isValid(validation);
            resolve(validation);
        });
    }
}
exports.default = PlaceCategoryService;
//# sourceMappingURL=index.js.map