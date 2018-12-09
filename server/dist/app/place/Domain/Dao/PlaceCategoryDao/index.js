"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDDao_1 = require("../../../../system/CRUDDao");
const index_1 = require("../../Entity/PlaceCategory/index");
const winston = require("winston");
class PlaceCategoryDao extends CRUDDao_1.CRUDDao {
    constructor(daos) {
        super(index_1.default.tableName);
        this.imageDao = daos.get('imageDao');
    }
    migrate(migrationDao) {
        function logError(error) {
            winston.error('Failed migrate place category: ' + error);
        }
        migrationDao.migrateFromFile('1 - Place category - insert default values', 'Arturs Cvetkovs', `${__dirname}/../../migrations/place_category_2.sql`).then(() => { }, logError);
    }
    createEntity() {
        return new index_1.default();
    }
    findAll(connection) {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then((categories) => {
                this.attachImageToArray(connection, categories)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllIn(connection, ids) {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then((categories) => {
                this.attachImageToArray(connection, categories)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllByCriteria(connection, criteria) {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then((categories) => {
                this.attachImageToArray(connection, categories)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findPageByCriteria(connection, criteria, page, perPage) {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then((page) => {
                this.attachImageToArray(connection, page.content)
                    .then((categories) => {
                    resolve(page);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findPage(connection, page, perPage) {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then((page) => {
                this.attachImageToArray(connection, page.content)
                    .then((categories) => {
                    resolve(page);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findOneByCriteria(connection, criteria) {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then((category) => {
                this.attachImage(connection, category)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    attachImageToArray(connection, placeCategories) {
        let promises = placeCategories.map((placeCategory) => {
            return this.attachImage(connection, placeCategory);
        });
        return Promise.all(promises);
    }
    attachImage(connection, placeCategory) {
        return new Promise((resolve, reject) => {
            if (placeCategory && placeCategory.icon) {
                this.imageDao.findById(connection, placeCategory.icon)
                    .then((image) => {
                    placeCategory.icon = image;
                    resolve(placeCategory);
                }, reject)
                    .catch(reject);
            }
            else {
                resolve(placeCategory);
            }
        });
    }
}
exports.default = PlaceCategoryDao;
//# sourceMappingURL=index.js.map