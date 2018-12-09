"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../Entity/Image/index");
const CRUDDao_1 = require("../../../../system/CRUDDao");
const winston = require("winston");
class ImageDao extends CRUDDao_1.CRUDDao {
    constructor() {
        super(index_1.default.tableName);
    }
    migrate(migrationDao) {
        migrationDao.migrateFromFile('1 - Image - Add default images', 'Arturs Cvetkovs', `${__dirname}/../../migrations/default_image_1.sql`)
            .catch((error) => { winston.error('Failed insert default images', error); });
        migrationDao.migrateFromFile('2 - Image - Add default place images', 'Arturs Cvetkovs', `${__dirname}/../../migrations/default_image_2.sql`)
            .catch((error) => { winston.error('Failed insert default place images', error); });
    }
    createEntity() {
        return new index_1.default();
    }
    findAll(connection) {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then((images) => {
                this.attachUriToImages(images);
                resolve(images);
            }, reject).catch(reject);
        });
    }
    findAllIn(connection, ids) {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then((images) => {
                this.attachUriToImages(images);
                resolve(images);
            }, reject).catch(reject);
        });
    }
    findAllByCriteria(connection, criteria) {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then((images) => {
                this.attachUriToImages(images);
                resolve(images);
            }, reject).catch(reject);
        });
    }
    findPageByCriteria(connection, criteria, page, perPage) {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then((page) => {
                this.attachUriToImages(page.content);
                resolve(page);
            }, reject).catch(reject);
        });
    }
    findPage(connection, page, perPage) {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then((page) => {
                this.attachUriToImages(page.content);
                resolve(page);
            }, reject).catch(reject);
        });
    }
    findOneByCriteria(connection, criteria) {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then((image) => {
                this.attachUriToImage(image);
                resolve(image);
            }, reject).catch(reject);
        });
    }
    saveEntity(connection, entity, onBeforeTransaction) {
        return new Promise((resolve, reject) => {
            super.saveEntity(connection, entity, onBeforeTransaction)
                .then((image) => {
                this.attachUriToImage(image);
                resolve(image);
            }, reject).catch(reject);
        });
    }
    attachUriToImages(images) {
        images.forEach((image) => {
            this.attachUriToImage(image);
        });
    }
    attachUriToImage(image) {
        if (image.type == index_1.default.TYPE_IMAGE) {
            image.uri = '/storage/image/' + image.hash;
        }
        else if (image.type == index_1.default.TYPE_IMAGE_PERMANENT) {
            image.uri = '/img' + image.path;
        }
    }
}
exports.default = ImageDao;
//# sourceMappingURL=index.js.map