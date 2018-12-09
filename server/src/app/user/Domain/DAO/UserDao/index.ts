"use strict";
import {CRUDDao, EntityFieldQuery, SearchOption} from "../../../../system/CRUDDao";
import User from "../../Entity/User/index";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import {IConnection} from "mysql";

export default class UserDao extends CRUDDao<User> {

    constructor() {
        super(User.TABLE_NAME);
    }

    migrate(migrationDao: MigrationDao): void {}

    createEntity(): User {
        return new User();
    }

    public findAllIn(connection: IConnection, ids: Array<number>, deep: number = 0):Promise<Array<User>> {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then(
                    (users) => {
                        if (deep == 0) {
                            this.attachFriendsToArray(connection, users)
                                .then(
                                    () => {
                                        resolve(users);
                                    },
                                    reject
                                )
                                .catch(reject);
                        } else {
                            resolve(users);
                        }
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findAllByCriteria(connection: IConnection, criteria: Map<string, any>, searchFields?: Array<SearchOption>): Promise<Array<User>> {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria, searchFields)
                .then(
                    (users) => {
                        this.attachFriendsToArray(connection, users)
                            .then(
                                () => {
                                    resolve(users);
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

    public findPageByCriteria(connection: IConnection, criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<User>> {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then(
                    (page) => {
                        this.attachFriendsToArray(connection, page.content)
                            .then(
                                () => {
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

    public findPage(connection: IConnection, page: number, perPage: number): Promise<RestPage<User>> {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then(
                    (page) => {
                        this.attachFriendsToArray(connection, page.content)
                            .then(
                                () => {
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

    public findOneByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<User> {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then(
                    (user) => {
                        this.attachFriends(connection, user)
                            .then(
                                () => {
                                    resolve(user);
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

    getUserPlaceInTop(userId: number):Promise<number> {
        return new Promise((resolve, reject) => {
            this.getConnection()
                .then(
                    (connection) => {
                        connection.query(`SELECT utr.position as position FROM (SELECT ut.*, @rownum := @rownum + 1 AS position FROM \`user_top\` ut JOIN (SELECT @rownum := 0) r) utr WHERE user_fk = ?`, [userId], (err, results, fields) => {
                            connection.release();
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve(results.length > 0 ? results[0].position : null);
                        });
                    },
                    reject
                )
                .catch(reject);
        });
    }

    findAllFacebookIdIn(connection: IConnection, ids: Array<string>):Promise<Array<User>> {
        if (!ids || !ids.length) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
            let query : EntityFieldQuery = {
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

                let promises: Array<Promise<User>> = Array();
                for (let rowNr in results) {
                    promises.push(this.getEntityFromRow(connection, results[rowNr]));
                }
                Promise.all(promises)
                    .then(resolve,reject)
                    .catch(reject);
            });
        });
    }

    attachFriendsToArray(connection: IConnection, users: Array<User>): Promise<Array<User>> {
        let promises: Array<Promise<User>> = users.map((user) => {
            return this.attachFriends(connection, user);
        });

        return Promise.all(promises);
    }

    private attachFriends(connection: IConnection, user: User): Promise<User> {
        if (!user) {
            return Promise.resolve(user);
        }
        return new Promise((resolve, reject) => {
            if (user.friends && user.friends.length) {
                this.findAllIn(connection, <Array<number>>user.friends, 1)
                    .then(
                        (users) => {
                            user.friends = users;
                            resolve(user);
                        },
                        reject
                    )
                    .catch(reject);
            } else {
                resolve(user);
            }
        });
    }
}