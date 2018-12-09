"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
const index_1 = require("../../Domain/Entity/Image/index");
const path = require("path");
const fs = require("fs");
const randomstring = require("randomstring");
const moment = require("moment");
class StorageService {
    constructor(daos) {
        this.imageDao = daos.get('imageDao');
        this.multerUploader = multer({
            dest: StorageService.DEFAULT_UPLOAD_FOLDER,
            storage: multer.memoryStorage(),
            limits: {
                fieldSize: 1024 * 5
            }
        });
    }
    saveImage(imageModel) {
        return new Promise((resolve, reject) => {
            this.imageDao.saveWithConnection({
                model: imageModel,
                onNewEntity: (entity, model) => {
                    entity.type = index_1.default.TYPE_IMAGE;
                    entity.originalName = imageModel.image.originalname;
                    entity.hash = randomstring.generate(7) + new Date().getTime() + randomstring.generate(7);
                    entity.creationDate = new Date();
                    entity.extension = path.extname(entity.originalName).slice(1);
                    entity.path = `image/${moment(entity.creationDate).format('YYYY/MM/DD')}/${entity.creationDate.getTime()}_${randomstring.generate(12)}.${entity.extension}`;
                },
                onUpdateEntity: (entity, model) => { },
                beforeCommitTransaction: (entity) => {
                    let imageFilePath = path.normalize(`${StorageService.DEFAULT_UPLOAD_FOLDER}/${entity.path}`);
                    let imageUploadFolder = path.dirname(imageFilePath);
                    if (!fs.existsSync(imageUploadFolder)) {
                        let folders = path.dirname(entity.path).split('/');
                        imageUploadFolder = StorageService.DEFAULT_UPLOAD_FOLDER;
                        for (let key in folders) {
                            imageUploadFolder += `/${folders[key]}`;
                            if (!fs.existsSync(imageUploadFolder)) {
                                fs.mkdirSync(path.normalize(imageUploadFolder));
                            }
                        }
                    }
                    fs.writeFileSync(imageFilePath, imageModel.image.buffer);
                }
            })
                .then(resolve, reject)
                .catch(reject);
        });
    }
    getImageRequestHandler(fieldName) {
        return this.multerUploader.single(fieldName);
    }
    deleteImage(id) {
        return new Promise((resolve, reject) => {
            this.imageDao.findByIdWithConnection(id)
                .then((image) => {
                image.deleted = true;
                this.imageDao.saveEntityWithConnection(image)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    getImagePage(page, perPage) {
        return new Promise((resolve, reject) => {
            let pageCriteria = new Map();
            pageCriteria.set('deleted', false);
            this.imageDao.findPageByCriteriaWithConnection(pageCriteria, page, perPage)
                .then(resolve, reject)
                .catch(reject);
        });
    }
    getImage(id) {
        return new Promise((resolve, reject) => {
            this.imageDao.findByIdWithConnection(id)
                .then(resolve, reject)
                .catch(reject);
        });
    }
    getImages(ids) {
        return this.imageDao.findAllInWithConnection(ids);
    }
    getImageByHash(hash) {
        let criteria = new Map();
        criteria.set('hash', hash);
        criteria.set('deleted', false);
        return new Promise((resolve, reject) => {
            this.imageDao.findOneByCriteriaWithConnection(criteria)
                .then(resolve, reject);
        });
    }
    getImageContentByHash(hash) {
        return new Promise((resolve, reject) => {
            this.getImageByHash(hash).then((image) => {
                if (!image) {
                    resolve(null);
                    return;
                }
                try {
                    let imagePath = path.normalize(`${StorageService.DEFAULT_UPLOAD_FOLDER}/${image.path}`);
                    let imageBuffer = fs.readFileSync(imagePath);
                    resolve({
                        content: imageBuffer,
                        contentType: `image/${image.extension}`
                    });
                }
                catch (e) {
                    reject(e);
                }
            }, reject);
        });
    }
    createModel(request) {
        return new Promise((resolve, reject) => {
            let content = request.body;
            let imageModel = {
                image: request.file
            };
            resolve(imageModel);
        });
    }
    validate(model, request) {
        return new Promise((resolve, reject) => {
            //TODO implement validation
            resolve({
                valid: true
            });
        });
    }
}
StorageService.DEFAULT_UPLOAD_FOLDER = `${__dirname}/../../../../uploads`;
exports.default = StorageService;
//# sourceMappingURL=index.js.map