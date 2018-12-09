'use strict';
import {CRUDDao, SearchOption} from "../../../../system/CRUDDao";
import MigrationDao from "../../../../migration/domain/dao/MigrationDao";
import {IConnection} from "mysql";
import UserLogin from "../../Entity/UserLogin/index";
import UserDao from "../UserDao/index";

export default class UserLoginDao extends CRUDDao<UserLogin> {

    private userDao:UserDao;

    constructor(daos: Map<string, CRUDDao<any>>) {
        super(UserLogin.TABLE_NAME);
        this.userDao = <UserDao>daos.get('userDao');
    }

    migrate(migrationDao: MigrationDao): void {}

    createEntity(): UserLogin {
        return new UserLogin();
    }

    public findAllIn(connection: IConnection, ids: Array<number>):Promise<Array<UserLogin>> {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then(
                    (userLoginList) => {
                        this.attachUserToArray(connection, userLoginList)
                            .then(
                                () => {
                                    resolve(userLoginList);
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

    public findAllByCriteria(connection: IConnection, criteria: Map<string, any>, searchFields?: Array<SearchOption>): Promise<Array<UserLogin>> {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria, searchFields)
                .then(
                    (userLoginList) => {
                        this.attachUserToArray(connection, userLoginList)
                            .then(
                                () => {
                                    resolve(userLoginList);
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

    public findPageByCriteria(connection: IConnection, criteria: Map<string, any>, page: number, perPage: number): Promise<RestPage<UserLogin>> {
        return new Promise((resolve, reject) => {
            super.findPageByCriteria(connection, criteria, page, perPage)
                .then(
                    (page) => {
                        this.attachUserToArray(connection, page.content)
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

    public findPage(connection: IConnection, page: number, perPage: number): Promise<RestPage<UserLogin>> {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then(
                    (page) => {
                        this.attachUserToArray(connection, page.content)
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

    public findOneByCriteria(connection: IConnection, criteria: Map<string, any>): Promise<UserLogin> {
        return new Promise((resolve, reject) => {
            super.findOneByCriteria(connection, criteria)
                .then(
                    (user) => {
                        this.attachUser(connection, user)
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

    attachUserToArray(connection: IConnection, userLoginList: Array<UserLogin>): Promise<Array<UserLogin>> {
        let promises: Array<Promise<UserLogin>> = userLoginList.map((userLogin) => {
            return this.attachUser(connection, userLogin);
        });

        return Promise.all(promises);
    }

    private attachUser(connection: IConnection, userLogin: UserLogin): Promise<UserLogin> {
        if (!userLogin) {
            return Promise.resolve(userLogin);
        }
        return new Promise((resolve, reject) => {
            if (userLogin.user) {
                this.userDao.findById(connection, <number>userLogin.user)
                    .then(
                        (user) => {
                            userLogin.user = user;
                            resolve(userLogin);
                        },
                        reject
                    ).catch(reject);
            } else {
                resolve(userLogin);
            }
        });
    }
}