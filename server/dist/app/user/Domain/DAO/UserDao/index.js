"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDDao_1 = require("../../../../system/CRUDDao");
const index_1 = require("../../Entity/User/index");
class UserDao extends CRUDDao_1.CRUDDao {
    constructor() {
        super(index_1.default.TABLE_NAME);
    }
    migrate(migrationDao) { }
    createEntity() {
        return new index_1.default();
    }
    findAllIn(connection, ids, deep = 0) {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then((users) => {
                if (deep == 0) {
                    this.attachFriendsToArray(connection, users)
                        .then(() => {
                        resolve(users);
                    }, reject)
                        .catch(reject);
                }
                else {
                    resolve(users);
                }
            }, reject)
                .catch(reject);
        });
    }
    findAllByCriteria(connection, criteria, searchFields) {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria, searchFields)
                .then((users) => {
                this.attachFriendsToArray(connection, users)
                    .then(() => {
                    resolve(users);
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
                this.attachFriendsToArray(connection, page.content)
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
                this.attachFriendsToArray(connection, page.content)
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
                .then((user) => {
                this.attachFriends(connection, user)
                    .then(() => {
                    resolve(user);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    getUserPlaceInTop(userId) {
        return new Promise((resolve, reject) => {
            this.getConnection()
                .then((connection) => {
                connection.query(`SELECT utr.position as position FROM (SELECT ut.*, @rownum := @rownum + 1 AS position FROM \`user_top\` ut JOIN (SELECT @rownum := 0) r) utr WHERE user_fk = ?`, [userId], (err, results, fields) => {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results.length > 0 ? results[0].position : null);
                });
            }, reject)
                .catch(reject);
        });
    }
    findAllFacebookIdIn(connection, ids) {
        if (!ids || !ids.length) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
            let query = {
                query: '',
                fields: Array()
            };
            ids.forEach((id) => {
                if (query.query.length > 0) {
                    query.query += ',';
                }
                query.query += '?';
                query.fields.push(id);
            });
            query.query = `SELECT * FROM \`${this.tableName}\` WHERE facebook_id IN (${query.query})`;
            connection.query(query.query, query.fields, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }
                let promises = Array();
                for (let rowNr in results) {
                    promises.push(this.getEntityFromRow(connection, results[rowNr]));
                }
                Promise.all(promises)
                    .then(resolve, reject)
                    .catch(reject);
            });
        });
    }
    attachFriendsToArray(connection, users) {
        let promises = users.map((user) => {
            return this.attachFriends(connection, user);
        });
        return Promise.all(promises);
    }
    attachFriends(connection, user) {
        if (!user) {
            return Promise.resolve(user);
        }
        return new Promise((resolve, reject) => {
            if (user.friends && user.friends.length) {
                this.findAllIn(connection, user.friends, 1)
                    .then((users) => {
                    user.friends = users;
                    resolve(user);
                }, reject)
                    .catch(reject);
            }
            else {
                resolve(user);
            }
        });
    }
}
exports.default = UserDao;
//# sourceMappingURL=index.js.map