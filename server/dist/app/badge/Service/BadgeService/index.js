"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator = require("validator");
const ValidationHelper_1 = require("../../../system/ValidationHelper");
class BadgeService {
    constructor(services, daos) {
        this.badgeDao = daos.get('badgeDao');
        this.storageService = services.get('storageService');
    }
    save(badgeModel) {
        return this.badgeDao.saveWithConnection({
            model: badgeModel,
            onNewEntity: (entity, model) => { },
            onUpdateEntity: (entity, model) => {
                entity.name = model.name;
                entity.congratulationText = model.congratulationText;
                entity.imageActivate = model.imageActivate;
                entity.imageDeactivate = model.imageDeactivate;
                entity.published = model.published;
                entity.aimText = model.aimText;
            }
        });
    }
    getPage(page, perPage) {
        let criteria = new Map();
        criteria.set('deleted', false);
        return this.badgeDao.findPageByCriteriaWithConnection(criteria, page, perPage);
    }
    getBadge(id) {
        return this.badgeDao.findByIdWithConnection(id);
    }
    getAllBadgesWithAchievementStatusForUser(userId) {
        return this.badgeDao.findAllWithAchievementStatus(userId);
    }
    deleteBadge(id) {
        return new Promise((resolve, reject) => {
            this.getBadge(id)
                .then((badge) => {
                if (!badge || badge.deleted) {
                    resolve(null);
                    return;
                }
                badge.deleted = true;
                this.badgeDao.saveEntityWithConnection(badge)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    getLatestBadge(user) {
        return this.badgeDao.findLatestAchivedBadge(user.id);
    }
    createModel(request) {
        return new Promise((resolve, reject) => {
            let content = request.body;
            let badgeModel = {
                id: content.id || undefined,
                name: content.name || '',
                congratulationText: content.congratulationText || '',
                aimText: content.aimText || '',
                published: content.published == 'on'
            };
            let promises = Array();
            promises.push(new Promise((resolve2, reject2) => {
                this.storageService.getImage(content.imageActivateId)
                    .then((image) => {
                    badgeModel.imageActivate = image;
                    resolve2();
                }, reject2)
                    .catch(reject2);
            }));
            promises.push(new Promise((resolve2, reject2) => {
                this.storageService.getImage(content.imageDeactivateId)
                    .then((image) => {
                    badgeModel.imageDeactivate = image;
                    resolve2();
                }, reject2)
                    .catch(reject2);
            }));
            Promise.all(promises)
                .then(() => {
                resolve(badgeModel);
            }, reject)
                .catch(reject);
        });
    }
    validate(model, request) {
        return new Promise((resolve, reject) => {
            let validation = {
                valid: true
            };
            validation.name = validator.isLength(model.name, { min: 2, max: 255 }) ? undefined : 'Badge name length must be between 2 and 255 symbols';
            validation.congratulationText = validator.isLength(model.congratulationText, { min: 5 }) ? undefined : 'Congratulation text must be at leas 5 symbols';
            validation.aimText = validator.isLength(model.aimText, { min: 5 }) ? undefined : 'AIM text must be at leas 5 symbols';
            validation.published = model.published && (!model.imageActivate || !model.imageDeactivate) ? 'You can\'t publish without badge images' : undefined;
            validation.valid = ValidationHelper_1.default.isValid(validation);
            resolve(validation);
        });
    }
}
exports.default = BadgeService;
//# sourceMappingURL=index.js.map