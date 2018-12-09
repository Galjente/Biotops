"use strict";
import {BeforeTransactionCallbackFunction, CRUDDao} from "../../../../system/CRUDDao";
import PlaceCategory from "../../Entity/PlaceCategory/index";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import * as winston from "winston";
import {IConnection} from "mysql";
import ImageDao from "../../../../storage/Domain/DAO/ImageDao/index";

export default class PlaceCategoryDao extends CRUDDao<PlaceCategory> {

    private imageDao: ImageDao;

    constructor(daos: Map<string, CRUDDao<any>>) {
        super(PlaceCategory.tableName);
        this.imageDao = <ImageDao>daos.get('imageDao');
    }

    migrate(migrationDao: MigrationDao): void {
        function logError(error) {
            winston.error('Failed migrate place category: ' + error)
        }

        migrationDao.migrateFromFile('1 - Place category - insert default values', 'Arturs Cvetkovs', `${__dirname}/../../migrations/place_category_2.sql`).then(() => {}, logError);
    }

    createEntity(): PlaceCategory {
        return new PlaceCategory();
    }

    public findAll(connection: IConnection): Promise<Array<PlaceCategory>>  {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then(
                    (categories) => {
                        this.attachImageToArray(connection, categories)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findAllIn(connection: IConnection, ids: Array<number>):Promise<Array<PlaceCategory>> {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then(
                    (categories) => {
                        this.attachImageToArray(connection, categories)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findAllByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<Array<PlaceCategory>> {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then(
                    (categories) => {
                        this.attachImageToArray(connection, categories)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findPageByCriteria(connection: IConnection, criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<PlaceCategory>> {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then(
                    (page) => {
                        this.attachImageToArray(connection, page.content)
                            .then(
                                (categories) => {
                                    resolve(page);
                                },
                                reject
                            )
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findPage(connection: IConnection, page: number, perPage: number): Promise<RestPage<PlaceCategory>> {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then(
                    (page) => {
                        this.attachImageToArray(connection, page.content)
                            .then(
                                (categories) => {
                                    resolve(page);
                                },
                                reject
                            )
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findOneByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<PlaceCategory> {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then(
                    (category) => {
                        this.attachImage(connection, category)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    private attachImageToArray(connection: IConnection, placeCategories: Array<PlaceCategory>): Promise<Array<PlaceCategory>> {
        let promises: Array<Promise<PlaceCategory>> = placeCategories.map((placeCategory) => {
            return this.attachImage(connection, placeCategory);
        });

        return Promise.all(promises);
    }

    private attachImage(connection: IConnection, placeCategory: PlaceCategory): Promise<PlaceCategory> {
        return new Promise((resolve, reject) => {
            if (placeCategory && placeCategory.icon) {
                this.imageDao.findById(connection, <number>placeCategory.icon)
                    .then(
                        (image) => {
                            placeCategory.icon = image;
                            resolve(placeCategory);
                        },
                        reject
                    )
                    .catch(reject);
            } else {
                resolve(placeCategory);
            }
        });
    }
}