"use strict";

import * as mysql from 'mysql';
import MigrationDao from "../migration/domain/dao/MigrationDao";
import {Entity} from "./Entity";
import {IConnection} from "mysql";
import * as winston from "winston";

export interface EntityFieldQuery {
    query: string;
    fields: Array<any>;
}

export interface SaveCallbackFunction {
    (entity: any, model: any):void;
}

export interface BeforeTransactionCallbackFunction {
    (entity: any):void;
}

export interface SaveOptions {
    model: any;
    onNewEntity: SaveCallbackFunction;
    onUpdateEntity: SaveCallbackFunction;
    beforeCommitTransaction?: BeforeTransactionCallbackFunction;
}

export interface SearchOption {
    field: string;
    direction: string;
}

export abstract class CRUDDao<TEntity extends Entity> {

    protected pool: mysql.IPool;
    protected tableName: string;

    abstract migrate(migrationDao: MigrationDao):void;
    abstract createEntity(): TEntity;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public init(pool: mysql.IPool): void {
        this.pool = pool;
    }

    protected getEntityFromRow(connection: IConnection, row: any): Promise<TEntity> {
        return new Promise((resolve, reject) => {
            let entity: TEntity = this.createEntity();
            let fieldsMap: Map<string, string> = entity.getFieldsMapping();

            for (let key in row) {
                if (fieldsMap.has(key)) {
                    entity[fieldsMap.get(key)] = row[key];
                }
            }

            if (entity.getFieldsManyToMany().size > 0) {
                let id: number = entity[entity.getIdFieldName()];
                let promises: Array<Promise<void>> = [];
                entity.getFieldsManyToMany().forEach((value, key) => {
                    let table: string = value.table;
                    let parentKey: string = value.parentKey;
                    let childKey: string = value.childKey;
                    promises.push(new Promise((resolve2, reject2) => {
                        connection.query(`SELECT * FROM \`${table}\` WHERE \`${parentKey}\`=${id};`, (err, results, fields) => {
                            if (err) {
                                winston.error(`Failed fetch many to many from \`${table}\` by \`${parentKey}\``, err);
                                reject2();
                                return;
                            }

                            entity[key] = new Array();
                            for (let rowNr in results) {
                                let row: any = results[rowNr];
                                entity[key].push(row[childKey]);
                            }
                            resolve2();
                        });
                    }));
                });

                if (promises.length) {
                    Promise.all(promises)
                        .then(
                            () => {
                                resolve(entity);
                            },
                            reject
                        )
                        .catch(reject);
                } else {
                    resolve(entity);
                }
            } else {
                resolve(entity);
            }
        });
    }

    public getConnection(): Promise<IConnection> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(connection);
            });
        });
    }

    public findAllWithConnection(searchFields?: Array<SearchOption>): Promise<Array<TEntity>> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.findAll(connection, searchFields)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public findAll(connection: IConnection, searchFields?: Array<SearchOption>): Promise<Array<TEntity>>  {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM \`${this.tableName}\``;
            if (searchFields) {
                sql += ' ORDER BY ';
                for (let i = 0; i < searchFields.length; i++) {
                    let searchField = searchFields[i];
                    sql += `${i > 0 ? ', ' : ''}${searchField.field} ${searchField.direction}`;
                }
            }
            sql += ';';
            connection.query(sql, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                let promises: Array<Promise<TEntity>> = Array();
                for (let rowNr in results) {
                    promises.push(this.getEntityFromRow(connection, results[rowNr]));
                }
                Promise.all(promises)
                    .then(resolve,reject)
                    .catch(reject);
            });
        });
    }

    public findAllInWithConnection(ids: Array<number>):Promise<Array<TEntity>> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.findAllIn(connection, ids)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public findAllIn(connection: IConnection, ids: Array<number>):Promise<Array<TEntity>> {
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
            query.query = `SELECT * FROM \`${this.tableName}\` WHERE id IN (${query.query})`;

            connection.query(query.query, query.fields, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                let promises: Array<Promise<TEntity>> = Array();
                for (let rowNr in results) {
                    promises.push(this.getEntityFromRow(connection, results[rowNr]));
                }
                Promise.all(promises)
                    .then(resolve,reject)
                    .catch(reject);
            });
        });
    }

    public findAllByCriteriaWithConnection(criteria: Map<string, any>, searchFields?: Array<SearchOption>): Promise<Array<TEntity>> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.findAllByCriteria(connection, criteria, searchFields)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public findAllByCriteria(connection: IConnection, criteria: Map<string, any>, searchFields?: Array<SearchOption>): Promise<Array<TEntity>> {
        return new Promise((resolve, reject) => {
            let selectQuery: EntityFieldQuery = this.generateSelectQuery(criteria);
            let sql = `SELECT * FROM \`${this.tableName}\` WHERE ${selectQuery.query}`;
            if (searchFields) {
                sql += ' ORDER BY ';
                for (let i = 0; i < searchFields.length; i++) {
                    let searchField = searchFields[i];
                    sql += `${i > 0 ? ', ' : ''}${searchField.field} ${searchField.direction}`;
                }
            }
            sql += ';';
            connection.query(sql, selectQuery.fields, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                let promises: Array<Promise<TEntity>> = Array();
                for (let rowNr in results) {
                    promises.push(this.getEntityFromRow(connection, results[rowNr]));
                }
                Promise.all(promises)
                    .then(resolve,reject)
                    .catch(reject);
            });
        });
    }

    public findPageByCriteriaWithConnection(criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<TEntity>> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.findPageByCriteria(connection, criteria, page, perPage)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public findPageByCriteria(connection: IConnection, criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<TEntity>> {
        return new Promise((resolve, reject) => {
            let selectQuery: EntityFieldQuery = this.generateSelectQuery(criteria);
            connection.query(`SELECT * FROM \`${this.tableName}\` WHERE ${selectQuery.query} LIMIT ${page * perPage}, ${perPage}`, selectQuery.fields, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                let promises: Array<Promise<TEntity>> = new Array();
                for (let rowNr in results) {
                    promises.push(this.getEntityFromRow(connection, results[rowNr]));
                }

                Promise.all(promises)
                    .then(
                        (entities) => {
                            connection.query(`SELECT COUNT(*) as \`count\` FROM \`${this.tableName}\` WHERE ${selectQuery.query}`, selectQuery.fields, (err, results, fields) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve({
                                    content: entities,
                                    page: page,
                                    perPage: perPage,
                                    totalPages: Math.ceil(results[0].count / perPage)
                                });
                            });
                        },
                        reject
                    ).catch(reject);
            });
        });
    }

    public findPageWithConnection(page: number, perPage: number): Promise<RestPage<TEntity>> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.findPage(connection, page, perPage)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public findPage(connection: IConnection, page: number, perPage: number): Promise<RestPage<TEntity>> {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM \`${this.tableName}\` LIMIT ${page * perPage}, ${perPage}`, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                let promises: Array<Promise<TEntity>> = new Array();
                for (let rowNr in results) {
                    promises.push(this.getEntityFromRow(connection, results[rowNr]));
                }

                Promise.all(promises)
                    .then(
                        (entities) => {
                            connection.query(`SELECT COUNT(*) as \`count\` FROM \`${this.tableName}\``, (err, results, fields) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve({
                                    content: entities,
                                    page: page,
                                    perPage: perPage,
                                    totalPages: Math.ceil(results[0].count / perPage)
                                });
                            });
                        },
                        (error) => {
                            reject(err);
                        }
                    )
                    .catch((error) => {
                        reject(err);
                    });
            });
        });
    }

    public findAllPublishedWithConnection(): Promise<Array<TEntity>> {
        return this.findAllByCriteriaWithConnection(new Map([['published', true]]));
    }

    public findAllPublished(connection: IConnection): Promise<Array<TEntity>> {
        return this.findAllByCriteria(connection, new Map([['published', true]]));
    }

    public findByIdWithConnection(id: any): Promise<TEntity> {
        if (!id) {
            return Promise.resolve(null);
        }
        let criteria: Map<string, any> = new Map([['id', id]]);
        return this.findOneByCriteriaWithConnection(criteria);
    }

    public findById(connection: IConnection, id: any): Promise<TEntity> {
        if (!id) {
            return Promise.resolve(null);
        }
        let criteria: Map<string, any> = new Map([['id', id]]);
        return this.findOneByCriteria(connection, criteria);
    }

    public findOneByCriteriaWithConnection(criteria: Map<string, any>): Promise<TEntity> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.findOneByCriteria(connection, criteria)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public findOneByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<TEntity> {
        return new Promise((resolve, reject) => {
            let selectQuery: EntityFieldQuery = this.generateSelectQuery(criteria);
            connection.query(`SELECT * FROM \`${this.tableName}\` WHERE ${selectQuery.query} LIMIT 0, 1`, selectQuery.fields, (err, results, fields) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (results.length > 1) {
                    reject(new Error("Too many results"));
                    return;
                }

                if (results.length == 0) {
                    resolve(null);
                } else {
                    this.getEntityFromRow(connection, results[0])
                        .then(resolve,reject)
                        .catch(reject);
                }
            });
        });
    }

    public saveWithConnection(options: SaveOptions): Promise<TEntity> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.save(connection, options)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public save(connection: IConnection, options: SaveOptions): Promise<TEntity> {
        return new Promise((resolve, reject) => {
            this.findById(connection, options.model.id)
                .then((entity) => {
                    if (!entity) {
                        entity = this.createEntity();
                        options.onNewEntity(entity, options.model);
                    }

                    options.onUpdateEntity(entity, options.model);
                    this.saveEntity(connection, entity, options.beforeCommitTransaction)
                        .then(resolve, reject)
                        .catch(reject);
                }, reject)
                .catch(reject)
        });
    }

    public saveAllEntities(connection: IConnection, entities: Array<TEntity>, onBeforeTransaction?:BeforeTransactionCallbackFunction): Promise<Array<TEntity>> {
        let promises: Array<Promise<TEntity>> = entities.map((entity) => {
            return this.saveEntity(connection, entity, onBeforeTransaction);
        });
        return Promise.all(promises);
    }

    public saveEntityWithConnection(entity: TEntity, onBeforeTransaction?:BeforeTransactionCallbackFunction): Promise<TEntity> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.saveEntity(connection, entity, onBeforeTransaction)
                    .then(
                        (entities) => {
                            connection.release();
                            resolve(entities);
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
    }

    public saveEntity(connection: IConnection, entity: TEntity, onBeforeTransaction?:BeforeTransactionCallbackFunction): Promise<TEntity> {
        return new Promise((resolve, reject) => {
            let query: EntityFieldQuery;

            if (entity[entity.getIdFieldName()]) {
                if (entity.getFieldsMapping().has('update_date')) {
                    entity['updateDate'] = new Date();
                }
                query = this.generateUpdateQuery(entity);
            } else {
                if (entity.getFieldsMapping().has('creation_date')) {
                    entity['creationDate'] = new Date();
                }
                query = this.generateInsertQuery(entity);
            }

            connection.beginTransaction((err) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query(query.query, query.fields, (err, results, fields) => {
                    if (err) {
                        connection.rollback(() => {
                            reject(err);
                        });
                        return;
                    }

                    if (!entity[entity.getIdFieldName()]) {
                        entity[entity.getIdFieldName()] = results.insertId;
                    }

                    let promises: Array<Promise<any>> = Array();
                    if (entity.getFieldsManyToMany().size > 0) {
                        let id:any = entity[entity.getIdFieldName()];
                        entity.getFieldsManyToMany().forEach((value, key) => {
                            if (entity[key] && entity[key].length > 0) {
                                promises.push(new Promise((resolve2, reject2) => {
                                    let queryData: Array<Array<number>> = new Array();

                                    entity[key].forEach((manyToManyValue) => {
                                        queryData.push([id, manyToManyValue.id]);
                                    });

                                    connection.query(`DELETE FROM \`${value.table}\` WHERE \`${value.parentKey}\`=${id}`, (err, results, fields) => {
                                        if (err) {
                                            reject2(err);
                                            return;
                                        }

                                        connection.query(`INSERT INTO \`${value.table}\`(\`${value.parentKey}\`, \`${value.childKey}\`) VALUES ?;`, [queryData], (err, results, fields) => {
                                            if (err) {
                                                reject2(err);
                                                return;
                                            }
                                            resolve2();
                                        });
                                    });
                                }));
                            }
                        });
                    } else {
                        promises.push(Promise.resolve());
                    }

                    Promise.all(promises)
                        .then(
                            () => {
                                try {
                                    if (onBeforeTransaction) {
                                        onBeforeTransaction(entity);
                                    }
                                    connection.commit((err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(entity);
                                        }
                                    });
                                } catch (e) {
                                    connection.rollback(() => {
                                        reject(e);
                                    });
                                }
                            },
                            (error) => {
                                connection.rollback(() => {
                                    reject(error);
                                });
                            }
                        )
                        .catch((error) => {
                            connection.rollback(() => {
                                reject(error);
                            });
                        });
                });
            });
        });
    }

    protected generateSelectQuery(criteria: Map<string, any>): EntityFieldQuery {
        let query : EntityFieldQuery = {
            query: '',
            fields: Array()
        };

        criteria.forEach((value, key, map) => {
            if (query.query) {
                query.query += ' AND ';
            }
            query.query += `\`${key}\` = ?`;
            query.fields.push(value);
        });

        return query;
    }

    protected generateInsertQuery(entity: TEntity): EntityFieldQuery {
        let query : EntityFieldQuery = {
            query: '',
            fields: Array()
        };

        let valuesQuestions = '';
        let fieldsRelation = entity.getFieldsRelation();
        entity.getFieldsMapping().forEach((value, key, map) => {
            if (value == entity.getIdFieldName()) {
                return;
            }
            if (query.query) {
                query.query += ', ';
                valuesQuestions += ', ';
            }
            query.query += `\`${key}\``;
            valuesQuestions += '?';
            if (fieldsRelation.indexOf(value) >= 0) {
                let relationEntity:Entity = entity[value];
                if (relationEntity) {
                    query.fields.push(relationEntity[relationEntity.getIdFieldName()]);
                } else {
                    query.fields.push(null);
                }
            } else {
                query.fields.push(entity[value]);
            }
        });

        query.query = `INSERT INTO \`${this.tableName}\` (${query.query}) VALUES(${valuesQuestions});`;

        return query;
    }

    protected generateUpdateQuery(entity: TEntity): EntityFieldQuery {
        let query : EntityFieldQuery = {
            query: '',
            fields: Array()
        };

        let entityFields = entity.getFieldsMapping();
        let fieldsRelation = entity.getFieldsRelation();
        entityFields.forEach((value, key, map) => {
            if (value == entity.getIdFieldName()) {
                return;
            }
            if (query.query) {
                query.query += ', ';
            }
            query.query += `\`${key}\` = ?`;
            if (fieldsRelation.indexOf(value) >= 0) {
                let relationEntity:Entity = entity[value];
                if (relationEntity) {
                    query.fields.push(relationEntity[relationEntity.getIdFieldName()]);
                } else {
                    query.fields.push(null);
                }
            } else {
                query.fields.push(entity[value]);
            }
        });

        query.query = `UPDATE \`${entity.getTableName()}\` SET ${query.query} WHERE ${entityFields.get(entity.getIdFieldName())} = ${entity[entity.getIdFieldName()]}`;

        return query;
    }
}