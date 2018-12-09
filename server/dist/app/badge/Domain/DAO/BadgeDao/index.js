"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDDao_1 = require("../../../../system/CRUDDao");
const Badge_1 = require("../../Entity/Badge");
const winston = require("winston");
const UserAchievedBadge_1 = require("../../Entity/UserAchievedBadge");
class BadgeWithAchievementStatus extends Badge_1.default {
}
exports.BadgeWithAchievementStatus = BadgeWithAchievementStatus;
class BadgeDao extends CRUDDao_1.CRUDDao {
    constructor(daos) {
        super(Badge_1.default.tableName);
        this.imageDao = daos.get('imageDao');
    }
    migrate(migrationDao) {
        migrationDao.migrateFromFile('1 - Badge - Insert default values', 'Arturs Cvetkovs', `${__dirname}/../../migrations/badge_1.sql`)
            .then(() => { }, (error) => {
            winston.error('Failed insert default badges', error);
        })
            .catch((error) => {
            winston.error('Failed insert default badges', error);
        });
    }
    createEntity() {
        return new Badge_1.default();
    }
    findAll(connection) {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then((badges) => {
                this.attachImageToArray(connection, badges)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllIn(connection, ids) {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then((badges) => {
                this.attachImageToArray(connection, badges)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllByCriteria(connection, criteria) {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then((badges) => {
                this.attachImageToArray(connection, badges)
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
                    .then((badges) => {
                    resolve(page);
                }, reject).catch(reject);
            }, reject).catch(reject);
        });
    }
    findPage(connection, page, perPage) {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then((page) => {
                this.attachImageToArray(connection, page.content)
                    .then((badges) => {
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
                .then((badge) => {
                this.attachImage(connection, badge)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllWithAchievementStatus(userId) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                connection.query(`SELECT b.*, uab.id achieved FROM \`${this.tableName}\` b LEFT JOIN \`${UserAchievedBadge_1.default.tableName}\` uab ON uab.user_fk=? AND uab.badge_fk=b.id WHERE b.published = 1;`, [userId], (err, results, fields) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }
                    let promises = Array();
                    for (let rowNr in results) {
                        promises.push(new Promise((resolve2, reject2) => {
                            let rowKey = rowNr;
                            this.getEntityFromRow(connection, results[rowKey])
                                .then((badge) => {
                                let badgeWithStatus = badge;
                                badgeWithStatus.achieved = results[rowKey]['achieved'] !== null;
                                this.attachImage(connection, badgeWithStatus)
                                    .then((badge) => {
                                    resolve2(badgeWithStatus);
                                }, reject2)
                                    .catch(reject2);
                            }, reject2)
                                .catch(reject2);
                        }));
                    }
                    Promise.all(promises)
                        .then((entities) => {
                        connection.release();
                        resolve(entities);
                    }, (error) => {
                        connection.release();
                        reject(error);
                    })
                        .catch((error) => {
                        connection.release();
                        reject(error);
                    });
                });
            });
        });
    }
    findLatestAchivedBadge(userId) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                connection.query(`SELECT b.*, uab.id achieved FROM \`${this.tableName}\` b LEFT JOIN \`${UserAchievedBadge_1.default.tableName}\` uab ON uab.user_fk=? AND uab.badge_fk=b.id WHERE b.published = 1 ORDER BY uab.creation_date ASC LIMIT 0,1;`, [userId], (err, results, fields) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }
                    if (!results || results.length == 0) {
                        resolve(null);
                        return;
                    }
                    let promise = new Promise((resolve2, reject2) => {
                        this.getEntityFromRow(connection, results[0])
                            .then((badge) => {
                            this.attachImage(connection, badge)
                                .then(resolve2, reject2)
                                .catch(reject2);
                        }, reject2)
                            .catch(reject2);
                    });
                    promise.then((entity) => {
                        connection.release();
                        resolve(entity);
                    }, (error) => {
                        connection.release();
                        reject(error);
                    }).catch((error) => {
                        connection.release();
                        reject(error);
                    });
                });
            });
        });
    }
    attachImageToArray(connection, badges) {
        let promises = badges.map((badge) => {
            return this.attachImage(connection, badge);
        });
        return Promise.all(promises);
    }
    attachImage(connection, badge) {
        return new Promise((resolve, reject) => {
            let promises = Array();
            if (badge.imageActivate) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.imageDao.findById(connection, badge.imageActivate)
                        .then((image) => {
                        badge.imageActivate = image;
                        resolve2(image);
                    }, reject2)
                        .catch(reject2);
                }));
            }
            if (badge.imageDeactivate) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.imageDao.findById(connection, badge.imageDeactivate)
                        .then((image) => {
                        badge.imageDeactivate = image;
                        resolve2(image);
                    }, reject2)
                        .catch(reject2);
                }));
            }
            if (promises.length == 0) {
                resolve(badge);
            }
            else {
                Promise.all(promises)
                    .then((images) => {
                    resolve(badge);
                }, reject)
                    .catch(reject);
            }
        });
    }
}
exports.default = BadgeDao;
//# sourceMappingURL=index.js.map