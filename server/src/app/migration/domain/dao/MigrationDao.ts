"use strict";

import * as mysql from 'mysql';
import * as winston from 'winston';
import * as fs from "fs";
import * as path from "path";
import {CRUDDao} from "../../../system/CRUDDao";

interface MigrationScriptModel {
    changeId:   string,
    author:     string,
    sql:        string
}

export default class MigrationDao {

    private static instance: MigrationDao = new MigrationDao();
    private tableName: string = "change_log";
    private pool: mysql.IPool;

    private constructor() {}

    public static getInstance() {
        return this.instance;
    }

    public init(pool: mysql.IPool, tableName?: string): Promise<any> {
        this.pool = pool;
        if (tableName) {
            this.tableName = tableName;
        }

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    winston.error("Migration failed get connection!", err);
                    reject();
                    return;
                }

                connection.query(`CREATE TABLE IF NOT EXISTS ${this.tableName} (
                                    id INT NOT NULL AUTO_INCREMENT,
                                    change_id VARCHAR(255) NOT NULL,
                                    author VARCHAR(255) NOT NULL,
                                    sql_query TEXT NOT NULL,
                                    rollback_sql_query TEXT,
                                    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    update_date TIMESTAMP NULL DEFAULT NULL,
                                    PRIMARY KEY(id),
                                    UNIQUE KEY (change_id, author)
                                )
                                ENGINE=InnoDB
                                CHARACTER SET utf8
                                COLLATE utf8_bin;`, (err, results, fields) => {
                    connection.release()
                    if (err) {
                        winston.error(`Failed to create ${this.tableName} table`, err);
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    public migrateFromFile(changeId: string, author:string, sqlFilePath:string, rollbackSqlFilePath?:string): Promise<any> {
        let normalizedSqlFilePath: string = path.normalize(sqlFilePath);
        let normalizedRollbackSqlFilePath: string = rollbackSqlFilePath ? path.normalize(rollbackSqlFilePath) : null;

        if (!fs.existsSync(normalizedSqlFilePath)) {
            return Promise.reject(new Error(`Sql script not exist: ${sqlFilePath}`));
        }

        if (normalizedRollbackSqlFilePath && !fs.existsSync(normalizedRollbackSqlFilePath)) {
            return Promise.reject(new Error(`Rollback sql script not exist: ${rollbackSqlFilePath}`));
        }

        let sql: string = fs.readFileSync(normalizedSqlFilePath, "utf8").toString();
        let rollbackSql: string = normalizedRollbackSqlFilePath ? fs.readFileSync(normalizedRollbackSqlFilePath, "utf8").toString() : '';

        return this.migrate(changeId, author, sql, rollbackSql);
    }

    public migrate(changeId: string, author:string, sql:string, rollbackSql:string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    winston.error("Migration failed get connection!", err);
                    reject();
                    return;
                }

                connection.beginTransaction((err) => {
                    winston.debug("Transaction started");
                    if (err) {
                        connection.release();
                        winston.error("Migration failed to start transaction!", err);
                        reject();
                        return;
                    }

                    this.existChangeLog(connection, changeId, author).then((exist) => {
                        if (exist) {
                            winston.debug("Change exist, releasing connection");
                            connection.rollback(() => {
                                connection.release();
                                resolve();
                            });
                            return;
                        }

                        let insertChangeLogPromise: Promise<boolean> = this.insertChangeLogData(connection, changeId, author, sql, rollbackSql);
                        let executeChangePromise: Promise<boolean> = this.executeChange(connection, sql);
                        Promise
                            .all([insertChangeLogPromise,executeChangePromise])
                            .then((result) => {
                                connection.commit(() => {
                                    connection.release();
                                    if (err) {
                                        winston.error("Migration failed to commit transaction!", err);
                                        reject();
                                    } else {
                                        resolve();
                                    }
                                });
                                resolve();
                            }, (error) => {
                                connection.rollback(() => {
                                    connection.release();
                                    winston.error('Failed to migrate, transaction rolling back');
                                    reject();
                                });
                            });
                    }, () => {
                        connection.rollback(() => {
                            connection.release();
                            winston.error('Failed to migrate, transaction rolling back');
                            reject();
                        });
                    });
                });
            });
        });
    }

    public startMigration(daos: Map<string, CRUDDao<any>>): Promise<any> {
        let self = this;
        return new Promise((resolve, reject) => {
            winston.debug("Starting Generic migration");
            let migrationValues: Array<MigrationScriptModel> = new Array(
                { changeId: '1 - Generic - Image create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/image_1.sql`},
                { changeId: '2 - Generic - Badge create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/badge_1.sql`},
                { changeId: '3 - Generic - Place category create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/place_category_1.sql`},
                { changeId: '4 - Generic - Place create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/place_1.sql`},
                { changeId: '5 - Generic - Place, Image create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/place_image_1.sql`},
                { changeId: '6 - Generic - Place, Place category create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/place_place_category_1.sql`},
                { changeId: '7 - Generic - User create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/user_1.sql`},
                { changeId: '8 - Generic - User archived badge create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/user_achieved_badge_1.sql`},
                { changeId: '9 - Generic - User visited place create table', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/user_visited_place_1.sql`},
                { changeId: '10 - Generic - User top', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/user_top_view_1.sql`},
                { changeId: '11 - Generic - User friends', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/user_friend_1.sql`},
                { changeId: '12 - Generic - Device errors', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/device_error_1.sql`},
                { changeId: '13 - Generic - User login', author: 'Arturs Cvetkovs', sql: `${__dirname}/../migrations/user_login_1.sql`}
            );
            function processScript(model?: MigrationScriptModel): Promise<any> {
                if (!model) {
                    return Promise.resolve();
                }

                return new Promise((resolve, reject) => {
                    self.migrateFromFile(model.changeId, model.author, model.sql).then(() => {
                        let nextModel:MigrationScriptModel = migrationValues.shift();
                        if (nextModel) {
                            processScript(nextModel).then(
                                () => {
                                    resolve();
                                },
                                (err) => {
                                    reject(err);
                                }
                            );
                        } else {
                            resolve();
                        }
                    }, (err) => {
                        reject(err);
                    });
                });
            }

            processScript(migrationValues.shift()).then(
                () => {
                    winston.debug("Starting DAO migration");
                    daos.forEach((dao, key, value) => {
                        dao.migrate(this);
                    });
                    resolve();
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    private existChangeLog(connection: mysql.IConnection, changeId: string, author:string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            winston.debug(`Selecting changes by change id and author("${changeId}", "${author}")`);
            connection.query(`SELECT COUNT(id) as count FROM ${this.tableName} WHERE change_id=? AND author=?`, [changeId, author], (err, results, fields) => {
                if (err) {
                    winston.error("Migration failed to select change log!", err);
                    reject();
                } else {
                    let exist = results[0].count > 0;
                    winston.debug(`Change was ${exist ? '' : 'not '}found`);
                    resolve(exist);
                }
            });
        });
    }

    private insertChangeLogData(connection: mysql.IConnection, changeId: string, author:string, sql:string, rollbackSql:string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            winston.debug(`Inserting change log with parameters change id and author ("${changeId}", "${author}")`);
            winston.silly(`SQL and rollback: "${sql}", "${rollbackSql}"`);
            connection.query(`INSERT INTO ${this.tableName} (change_id, author, sql_query, rollback_sql_query, update_date) VALUES (?, ?, ?, ?, ?)`,
                            [changeId, author, sql, rollbackSql, new Date], (err, results, fields) => {
                if (err) {
                    winston.error("Migration failed to insert change log!", err);
                    reject();
                } else {
                    resolve(results.length > 0);
                }
            });
        });
    }

    private executeChange(connection: mysql.IConnection, sql:string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            winston.silly(`Executing query: "${sql}"`);
            connection.query(sql, (err, results, fields) => {
                if (err) {
                    winston.error(`Migration failed to execute query: "${sql}"`, err);
                    reject();
                } else {
                    resolve(results.length > 0);
                }
            });
        });
    }
}