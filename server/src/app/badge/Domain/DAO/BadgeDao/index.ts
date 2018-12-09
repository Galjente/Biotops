"use strict";
import {BeforeTransactionCallbackFunction, CRUDDao} from "../../../../system/CRUDDao";
import Badge from "../../Entity/Badge";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import * as winston from "winston";
import UserAchievedBadge from "../../Entity/UserAchievedBadge";
import ImageDao from "../../../../storage/Domain/DAO/ImageDao/index";
import Image from "../../../../storage/Domain/Entity/Image/index";
import {IConnection} from "mysql";

export class BadgeWithAchievementStatus extends Badge {
    public achieved: boolean;
}

export default class BadgeDao extends CRUDDao<Badge> {

    private imageDao: ImageDao;

    constructor(daos: Map<string, CRUDDao<any>>) {
        super(Badge.tableName);
        this.imageDao = <ImageDao>daos.get('imageDao');
    }

    migrate(migrationDao: MigrationDao): void {
        migrationDao.migrateFromFile('1 - Badge - Insert default values', 'Arturs Cvetkovs', `${__dirname}/../../migrations/badge_1.sql`)
            .then(
                () => {},
                (error) => {
                    winston.error('Failed insert default badges', error)
                }
            )
            .catch((error) => {
                winston.error('Failed insert default badges', error)
            })
    }

    createEntity(): Badge {
        return new Badge();
    }

    public findAll(connection: IConnection): Promise<Array<Badge>>  {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then(
                    (badges) => {
                        this.attachImageToArray(connection, badges)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);

        });
    }

    public findAllIn(connection: IConnection, ids: Array<number>):Promise<Array<Badge>> {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then(
                    (badges) => {
                        this.attachImageToArray(connection, badges)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findAllByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<Array<Badge>> {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then(
                    (badges) => {
                        this.attachImageToArray(connection, badges)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findPageByCriteria(connection: IConnection, criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<Badge>> {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then(
                    (page) => {
                        this.attachImageToArray(connection, page.content)
                            .then(
                                (badges) => {
                                    resolve(page);
                                },
                                reject
                            ).catch(reject);
                    },
                    reject
                ).catch(reject);
        });
    }

    public findPage(connection: IConnection, page: number, perPage: number): Promise<RestPage<Badge>> {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then(
                    (page) => {
                        this.attachImageToArray(connection, page.content)
                            .then(
                                (badges) => {
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

    public findOneByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<Badge> {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then(
                    (badge) => {
                        this.attachImage(connection, badge)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    findAllWithAchievementStatus(userId: number): Promise<Array<BadgeWithAchievementStatus>> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query(`SELECT b.*, uab.id achieved FROM \`${this.tableName}\` b LEFT JOIN \`${UserAchievedBadge.tableName}\` uab ON uab.user_fk=? AND uab.badge_fk=b.id WHERE b.published = 1;`, [userId], (err, results, fields) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    let promises: Array<Promise<BadgeWithAchievementStatus>> = Array();
                    for (let rowNr in results) {
                        promises.push(new Promise((resolve2, reject2) => {
                            let rowKey = rowNr;
                            this.getEntityFromRow(connection, results[rowKey])
                                .then(
                                    (badge) => {
                                        let badgeWithStatus:BadgeWithAchievementStatus = <BadgeWithAchievementStatus>badge;
                                        badgeWithStatus.achieved = results[rowKey]['achieved'] !== null;
                                        this.attachImage(connection, badgeWithStatus)
                                            .then(
                                                (badge) => {
                                                    resolve2(badgeWithStatus);
                                                },
                                                reject2
                                            )
                                            .catch(reject2);
                                    },
                                    reject2
                                )
                                .catch(reject2);
                        }));
                    }

                    Promise.all(promises)
                        .then(
                            (entities) => {
                                connection.release();
                                resolve(entities);
                            },
                            (error) => {
                                connection.release();
                                reject(error);
                            }
                        )
                        .catch((error) => {
                            connection.release();
                            reject(error);
                        });
                });
            });
        });
    }

    findLatestAchivedBadge(userId: number): Promise<Badge> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query(`SELECT b.*, uab.id achieved FROM \`${this.tableName}\` b LEFT JOIN \`${UserAchievedBadge.tableName}\` uab ON uab.user_fk=? AND uab.badge_fk=b.id WHERE b.published = 1 ORDER BY uab.creation_date ASC LIMIT 0,1;`, [userId], (err, results, fields) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }

                    if (!results || results.length == 0) {
                        resolve(null);
                        return;
                    }

                    let promise: Promise<Badge> = new Promise((resolve2, reject2) => {
                        this.getEntityFromRow(connection, results[0])
                            .then(
                                (badge) => {
                                    this.attachImage(connection, badge)
                                        .then(resolve2, reject2)
                                        .catch(reject2);
                                },
                                reject2
                            )
                            .catch(reject2);
                    });

                    promise.then(
                        (entity) => {
                            connection.release();
                            resolve(entity);
                        },
                        (error) => {
                            connection.release();
                            reject(error);
                        }
                    ).catch((error) => {
                        connection.release();
                        reject(error);
                    });
                });
            });
        });
    }

    private attachImageToArray(connection: IConnection, badges: Array<Badge>): Promise<Array<Badge>> {
        let promises: Array<Promise<Badge>> = badges.map((badge) => {
            return this.attachImage(connection, badge);
        });

        return Promise.all(promises);
    }

    private attachImage(connection: IConnection, badge: Badge): Promise<Badge> {
        return new Promise((resolve, reject) => {
            let promises: Array<Promise<Image>> = Array();

            if (badge.imageActivate) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.imageDao.findById(connection, <number>badge.imageActivate)
                        .then(
                            (image) => {
                                badge.imageActivate = image;
                                resolve2(image);
                            },
                            reject2
                        )
                        .catch(reject2);
                }));
            }

            if (badge.imageDeactivate) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.imageDao.findById(connection, <number>badge.imageDeactivate)
                        .then(
                            (image) => {
                                badge.imageDeactivate = image;
                                resolve2(image);
                            },
                            reject2
                        )
                        .catch(reject2);
                }));
            }

            if (promises.length == 0) {
                resolve(badge);
            } else {
                Promise.all(promises)
                    .then(
                        (images) => {
                            resolve(badge);
                        },
                        reject
                    )
                    .catch(reject);
            }

        });
    }
}
