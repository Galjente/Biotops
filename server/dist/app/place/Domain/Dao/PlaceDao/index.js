"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDDao_1 = require("../../../../system/CRUDDao");
const index_1 = require("../../Entity/Place/index");
class PlaceDao extends CRUDDao_1.CRUDDao {
    constructor(daos) {
        super(index_1.default.TABLE_NAME);
        this.placeCategoryDao = daos.get('placeCategoryDao');
        this.imageDao = daos.get('imageDao');
    }
    migrate(migrationDao) { }
    createEntity() {
        return new index_1.default();
    }
    findAllIn(connection, ids) {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then((places) => {
                let promises = [];
                promises.push(this.attachPlaceCategoryToArray(connection, places));
                promises.push(this.attachImageToArray(connection, places));
                Promise.all(promises)
                    .then(() => {
                    resolve(places);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllByCriteria(connection, criteria, searchFields) {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria, searchFields)
                .then((places) => {
                let promises = [];
                promises.push(this.attachPlaceCategoryToArray(connection, places));
                promises.push(this.attachImageToArray(connection, places));
                Promise.all(promises)
                    .then(() => {
                    resolve(places);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findPageByCriteria(connection, criteria, page, perPage) {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then((page) => {
                let promises = [];
                promises.push(this.attachPlaceCategoryToArray(connection, page.content));
                promises.push(this.attachImageToArray(connection, page.content));
                Promise.all(promises)
                    .then(() => {
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
                let promises = [];
                promises.push(this.attachPlaceCategoryToArray(connection, page.content));
                promises.push(this.attachImageToArray(connection, page.content));
                Promise.all(promises)
                    .then(() => {
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
                .then((place) => {
                let promises = [];
                promises.push(this.attachPlaceCategory(connection, place));
                promises.push(this.attachImage(connection, place));
                Promise.all(promises)
                    .then(() => {
                    resolve(place);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findPlacesInBounds(point, pointBounds, limit = 3) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                let currentLatitude = connection.escape(point.latitude);
                let currentLongitude = connection.escape(point.longitude);
                let sql = 'SELECT *,';
                sql += `(ASIN(SQRT(POWER(SIN((${currentLatitude} - latitude) * pi()/180 / 2), 2) + COS(${currentLatitude} * pi()/180) * COS(latitude * pi()/180) * POWER(SIN((${currentLongitude} - longitude) * pi()/180 / 2), 2)))) distance`;
                sql += ` FROM \`${this.tableName}\` WHERE deleted = false AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ? ORDER BY distance ASC LIMIT 0,?;`;
                connection.query(sql, [pointBounds.min.latitude, pointBounds.max.latitude, pointBounds.min.longitude, pointBounds.max.longitude, limit], (err, results, fields) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }
                    let promises = Array();
                    for (let rowNr in results) {
                        promises.push(new Promise((resolve2, reject2) => {
                            this.getEntityFromRow(connection, results[rowNr])
                                .then((place) => {
                                let promises = [];
                                promises.push(this.attachPlaceCategory(connection, place));
                                promises.push(this.attachImage(connection, place));
                                Promise.all(promises)
                                    .then(() => {
                                    resolve2(place);
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
    findTopPlaces(top = 10) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                let sql = `SELECT p.*, COUNT(uvp.place_fk) as checkin_count, MAX(uvp.creation_date) as last_checkin_date FROM \`${this.tableName}\` as p`;
                sql += ` LEFT JOIN \`user_visited_place\` as uvp ON p.id = uvp.place_fk`;
                sql += ` GROUP by p.id ORDER BY checkin_count DESC, last_checkin_date ASC LIMIT 0,?`;
                connection.query(sql, [top], (err, results, fields) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }
                    let promises = Array();
                    for (let rowNr in results) {
                        promises.push(new Promise((resolve2, reject2) => {
                            this.getEntityFromRow(connection, results[rowNr])
                                .then((place) => {
                                let promises = [];
                                promises.push(this.attachPlaceCategory(connection, place));
                                promises.push(this.attachImage(connection, place));
                                Promise.all(promises)
                                    .then(() => {
                                    resolve2(place);
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
    searchPlace(text, categories) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT p.* FROM \`place\` as p LEFT JOIN \`place_place_category\` as ppc ON p.id = ppc.place_fk`;
            sql += ` WHERE LOWER(p.name) like LOWER(?) COLLATE utf8_latvian_ci`;
            if (categories && categories.length) {
                sql += ` AND ppc.\`place_category_fk\` IN (?)`;
            }
            sql += ` GROUP BY p.id ORDER BY p.name ASC;`;
            this.getConnection().then((connection) => {
                connection.query(sql, [`%${text}%`, categories], (err, results, fields) => {
                    if (err) {
                        connection.release();
                        reject(err);
                        return;
                    }
                    let promises = Array();
                    for (let rowNr in results) {
                        promises.push(new Promise((resolve2, reject2) => {
                            this.getEntityFromRow(connection, results[rowNr])
                                .then((place) => {
                                let promises = [];
                                promises.push(this.attachPlaceCategory(connection, place));
                                promises.push(this.attachImage(connection, place));
                                Promise.all(promises)
                                    .then(() => {
                                    resolve2(place);
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
            }, reject).catch(reject);
        });
    }
    attachPlaceCategoryToArray(connection, places) {
        let promises = places.map((place) => {
            return this.attachPlaceCategory(connection, place);
        });
        return Promise.all(promises);
    }
    attachPlaceCategory(connection, place) {
        return new Promise((resolve, reject) => {
            if (place && place.categories && place.categories.length > 0) {
                this.placeCategoryDao.findAllIn(connection, place.categories)
                    .then((categories) => {
                    place.categories = categories;
                    resolve(place);
                }, reject)
                    .catch(reject);
            }
            else {
                resolve(place);
            }
        });
    }
    attachImageToArray(connection, badges) {
        let promises = badges.map((place) => {
            return this.attachImage(connection, place);
        });
        return Promise.all(promises);
    }
    attachImage(connection, place) {
        if (!place) {
            return Promise.resolve(place);
        }
        return new Promise((resolve, reject) => {
            if (place.images && place.images.length) {
                this.imageDao.findAllIn(connection, place.images)
                    .then((images) => {
                    place.images = images;
                    resolve(place);
                }, reject)
                    .catch(reject);
            }
            else {
                resolve(place);
            }
        });
    }
}
exports.default = PlaceDao;
//# sourceMappingURL=index.js.map