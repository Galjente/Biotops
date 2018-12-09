"use strict";
import {Request, RequestHandler} from 'express';
import {ModelValidation, ValidationService} from "../../../system/ValidationService";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import {CRUDDao} from "../../../system/CRUDDao";
import ImageDao from "../../Domain/DAO/ImageDao/index";
import * as multer from 'multer';
import Image from "../../Domain/Entity/Image/index";
import * as path from "path";
import * as fs from "fs";
import * as randomstring from "randomstring";
import * as moment from "moment";

interface ImageModel {
    image: any;
}

interface ImageResponseModel {
    content: Buffer;
    contentType: string;
}

export default class StorageService implements ValidationService<ImageModel> {

    private static DEFAULT_UPLOAD_FOLDER:string = `${__dirname}/../../../../uploads`;

    private imageDao:ImageDao;
    private multerUploader;

    constructor(daos: Map<string, CRUDDao<any>>) {
        this.imageDao = <ImageDao>daos.get('imageDao');

        this.multerUploader = multer({
            dest: StorageService.DEFAULT_UPLOAD_FOLDER,
            storage: multer.memoryStorage(),
            limits: {
                fieldSize: 1024 * 5
            }
        });
    }

    saveImage(imageModel: ImageModel):Promise<Image> {
        return new Promise((resolve, reject) => {
            this.imageDao.saveWithConnection({
                model: imageModel,
                onNewEntity: (entity, model) => {
                    entity.type = Image.TYPE_IMAGE;
                    entity.originalName = imageModel.image.originalname;
                    entity.hash = randomstring.generate(7) + new Date().getTime() + randomstring.generate(7);
                    entity.creationDate = new Date();
                    entity.extension = path.extname(entity.originalName).slice(1);
                    entity.path = `image/${moment(entity.creationDate).format('YYYY/MM/DD')}/${entity.creationDate.getTime()}_${randomstring.generate(12)}.${entity.extension}`;
                },
                onUpdateEntity: (entity, model) => {},
                beforeCommitTransaction: (entity) => {
                    let imageFilePath: string = path.normalize(`${StorageService.DEFAULT_UPLOAD_FOLDER}/${entity.path}`);
                    let imageUploadFolder: string = path.dirname(imageFilePath);
                    if (!fs.existsSync(imageUploadFolder)) {
                        let folders = path.dirname(entity.path).split('/');
                        imageUploadFolder = StorageService.DEFAULT_UPLOAD_FOLDER;
                        for(let key in folders) {
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

    getImageRequestHandler(fieldName:string): RequestHandler {
        return this.multerUploader.single(fieldName);
    }

    deleteImage(id:number):Promise<Image> {
        return new Promise((resolve, reject) => {
            this.imageDao.findByIdWithConnection(id)
                .then(
                    (image) => {
                        image.deleted = true;
                        this.imageDao.saveEntityWithConnection(image)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    getImagePage(page: number, perPage: number):Promise<RestPage<Image>> {
        return new Promise((resolve, reject) => {
            let pageCriteria: Map<string, any> = new Map();
            pageCriteria.set('deleted', false);
            this.imageDao.findPageByCriteriaWithConnection(pageCriteria, page, perPage)
                .then(resolve, reject)
                .catch(reject);
        });
    }

    getImage(id: number):Promise<Image> {
        return new Promise((resolve, reject) => {
            this.imageDao.findByIdWithConnection(id)
                .then(resolve, reject)
                .catch(reject);
        });
    }

    getImages(ids: Array<number>):Promise<Array<Image>> {
        return this.imageDao.findAllInWithConnection(ids);
    }

    getImageByHash(hash:string):Promise<Image> {
        let criteria: Map<string, any> = new Map();
        criteria.set('hash', hash);
        criteria.set('deleted', false);
        return new Promise((resolve, reject) => {
            this.imageDao.findOneByCriteriaWithConnection(criteria)
                .then(resolve, reject);
        });
    }

    getImageContentByHash(hash:string): Promise<ImageResponseModel> {
        return new Promise((resolve, reject) => {
            this.getImageByHash(hash).then(
                (image) => {
                    if (!image) {
                        resolve(null);
                        return;
                    }
                    try {
                        let imagePath = path.normalize(`${StorageService.DEFAULT_UPLOAD_FOLDER}/${image.path}`);
                        let imageBuffer: Buffer = fs.readFileSync(imagePath);
                        resolve({
                            content: imageBuffer,
                            contentType: `image/${image.extension}`
                        });
                    } catch(e) {
                        reject(e);
                    }
                },
                reject
            );
        });
    }

    createModel(request: Request & RequestWithLocale): Promise<ImageModel> {
        return new Promise((resolve, reject) => {
            let content: any = request.body;
            let imageModel: ImageModel = {
                image: request.file
            };

            resolve(imageModel);
        });
    }

    validate(model: any, request: Request & RequestWithLocale): Promise<ModelValidation> {
        return new Promise((resolve, reject) => {
            //TODO implement validation
            resolve({
                valid: true
            });
        });
    }

}