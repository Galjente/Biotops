"use strict";
import Image from "../../Entity/Image/index";
import {BeforeTransactionCallbackFunction, CRUDDao, SaveOptions} from "../../../../system/CRUDDao";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import * as winston from "winston";
import {IConnection} from "mysql";

export default class ImageDao extends CRUDDao<Image> {

    constructor() {
        super(Image.tableName);
    }

    migrate(migrationDao: MigrationDao): void {
        migrationDao.migrateFromFile('1 - Image - Add default images', 'Arturs Cvetkovs', `${__dirname}/../../migrations/default_image_1.sql`)
            .catch((error) => {winston.error('Failed insert default images', error)});
        migrationDao.migrateFromFile('2 - Image - Add default place images', 'Arturs Cvetkovs', `${__dirname}/../../migrations/default_image_2.sql`)
            .catch((error) => {winston.error('Failed insert default place images', error)});
        migrationDao.migrateFromFile('2 - Image - Add second default place images', 'Arturs Cvetkovs', `${__dirname}/../../migrations/default_image_3.sql`)
            .catch((error) => {winston.error('Failed insert second default place images', error)});
    }

    createEntity(): Image {
        return new Image();
    }

    public findAll(connection: IConnection): Promise<Array<Image>>  {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then(
                    (images) => {
                        this.attachUriToImages(images);
                        resolve(images);
                    },
                    reject
                ).catch(reject);
        });
    }

    public findAllIn(connection: IConnection, ids: Array<number>):Promise<Array<Image>> {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then(
                    (images) => {
                        this.attachUriToImages(images);
                        resolve(images);
                    },
                    reject
                ).catch(reject);
        });
    }

    public findAllByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<Array<Image>> {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then(
                    (images) => {
                        this.attachUriToImages(images);
                        resolve(images);
                    },
                    reject
                ).catch(reject);
        });
    }

    public findPageByCriteria(connection: IConnection, criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<Image>> {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then(
                    (page) => {
                        this.attachUriToImages(page.content);
                        resolve(page);
                    },
                    reject
                ).catch(reject);
        });
    }

    public findPage(connection: IConnection, page: number, perPage: number): Promise<RestPage<Image>> {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then(
                    (page) => {
                        this.attachUriToImages(page.content);
                        resolve(page);
                    },
                    reject
                ).catch(reject);
        });
    }

    public findOneByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<Image> {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then(
                    (image) => {
                        this.attachUriToImage(image);
                        resolve(image);
                    },
                    reject
                ).catch(reject);
        });
    }

    public saveEntity(connection: IConnection, entity: Image, onBeforeTransaction?:BeforeTransactionCallbackFunction): Promise<Image> {
        return new Promise((resolve, reject) => {
            super.saveEntity(connection, entity, onBeforeTransaction)
                .then(
                    (image) => {
                        this.attachUriToImage(image);
                        resolve(image);
                    },
                    reject
                ).catch(reject);
        });
    }

    private attachUriToImages(images: Array<Image>):void {
        images.forEach((image) => {
            this.attachUriToImage(image);
        });
    }

    private attachUriToImage(image: Image):void {
        if (image.type == Image.TYPE_IMAGE) {
            image.uri = '/storage/image/' + image.hash;
        } else if (image.type == Image.TYPE_IMAGE_PERMANENT) {
            image.uri = '/img' + image.path;
        }
    }
}