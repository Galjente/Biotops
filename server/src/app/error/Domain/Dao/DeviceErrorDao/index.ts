'use strict';
import {CRUDDao} from "../../../../system/CRUDDao";
import DeviceError from "../Entity/DeviceError/index";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import {IConnection} from "mysql";
import UserDao from "../../../../user/Domain/DAO/UserDao/index";

export default class DeviceErrorDao extends CRUDDao<DeviceError> {

    private userDao: UserDao;

    constructor(daos: Map<string, CRUDDao<any>>) {
        super(DeviceError.TABLE_NAME);
        this.userDao = <UserDao>daos.get('userDao');
    }

    migrate(migrationDao: MigrationDao): void {}

    createEntity(): DeviceError {
        return new DeviceError();
    }

    public findAll(connection: IConnection): Promise<Array<DeviceError>>  {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then(
                    (errors) => {
                        this.attachUserToArray(connection, errors)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);

        });
    }

    public findAllIn(connection: IConnection, ids: Array<number>):Promise<Array<DeviceError>> {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then(
                    (errors) => {
                        this.attachUserToArray(connection, errors)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findAllByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<Array<DeviceError>> {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then(
                    (errors) => {
                        this.attachUserToArray(connection, errors)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    public findPageByCriteria(connection: IConnection, criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<DeviceError>> {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then(
                    (page) => {
                        this.attachUserToArray(connection, page.content)
                            .then(
                                (errors) => {
                                    resolve(page);
                                },
                                reject
                            ).catch(reject);
                    },
                    reject
                ).catch(reject);
        });
    }

    public findPage(connection: IConnection, page: number, perPage: number): Promise<RestPage<DeviceError>> {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then(
                    (page) => {
                        this.attachUserToArray(connection, page.content)
                            .then(
                                (errors) => {
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

    public findOneByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<DeviceError> {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then(
                    (error) => {
                        this.attachUser(connection, error)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    private attachUserToArray(connection: IConnection, deviceErrors: Array<DeviceError>): Promise<Array<DeviceError>> {
        let promises: Array<Promise<DeviceError>> = deviceErrors.map((deviceError) => {
            return this.attachUser(connection, deviceError);
        });

        return Promise.all(promises);
    }

    private attachUser(connection: IConnection, deviceError: DeviceError): Promise<DeviceError> {
        return new Promise((resolve, reject) => {
            if (deviceError.user) {
                this.userDao.findById(connection, <number>deviceError.user)
                    .then(
                        (user) => {
                            deviceError.user = user;
                            resolve(deviceError);
                        },
                        reject
                    ).catch(reject);
            } else {
                resolve(deviceError);
            }
        });
    }
}