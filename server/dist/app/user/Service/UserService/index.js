"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../Domain/Entity/User/index");
const randomstring = require("randomstring");
const crypto = require("crypto");
const winston = require("winston");
const ValidationHelper_1 = require("../../../system/ValidationHelper");
const validator = require("validator");
const facebook_graph_1 = require("facebook-graph");
const index_2 = require("../../Domain/Entity/UserLogin/index");
class UserService {
    constructor(daos) {
        this.userDao = daos.get('userDao');
        this.userLoginDao = daos.get('userLoginDao');
    }
    getById(id) {
        return this.userDao.findByIdWithConnection(id);
    }
    getByLogin(login) {
        let criteria = new Map();
        criteria.set('login', login);
        return this.userDao.findOneByCriteriaWithConnection(criteria);
    }
    getUserByUsernameAndPassword(username, password) {
        return new Promise((resolve, reject) => {
            if (!username || !password) {
                winston.debug('getUserByUsernameAndPassword: username or password empty');
                reject('Missing email or password');
                return;
            }
            let criteria = new Map();
            criteria.set('login', username);
            this.userDao.findOneByCriteriaWithConnection(criteria)
                .then((user) => {
                if (!user) {
                    winston.debug('getUserByUsernameAndPassword: user not found');
                    resolve(null);
                    return;
                }
                let hashedPassword = this.getPasswordHash(password, user.secret);
                if (user.password === hashedPassword) {
                    resolve(user);
                }
                else {
                    winston.debug('getUserByUsernameAndPassword: hash not equals');
                    reject('Missing email or password');
                }
            }, reject)
                .catch(reject);
        });
    }
    getByToken(token) {
        let criteria = new Map();
        criteria.set('token', token);
        return this.userDao.findOneByCriteriaWithConnection(criteria);
    }
    save(userModel) {
        return this.userDao.saveWithConnection({
            model: userModel,
            onNewEntity: (entity, model) => {
                entity.secret = crypto.randomBytes(16).toString('hex');
                entity.password = model.password ? this.getPasswordHash(model.password, entity.secret) : null;
            },
            onUpdateEntity: (entity, model) => {
                entity.name = model.name;
                entity.surname = model.surname;
                entity.login = model.email;
                entity.enabled = model.enabled;
                entity.admin = model.admin;
            }
        });
    }
    deleteToken(id) {
        return new Promise((resolve, reject) => {
            this.userDao.findByIdWithConnection(id)
                .then((user) => {
                user.token = null;
                this.userDao.saveEntityWithConnection(user)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    getOrCreateByFacebook(facebookId, name, surname, photoLink) {
        if (!facebookId) {
            return Promise.resolve(null);
        }
        return new Promise((resolve, reject) => {
            this.userDao.getConnection().then((connection) => {
                let findUserCriteria = new Map();
                findUserCriteria.set('facebook_id', facebookId);
                this.userDao.findOneByCriteria(connection, findUserCriteria)
                    .then((user) => {
                    if (!user) {
                        user = new index_1.default();
                        user.facebookId = facebookId;
                    }
                    user.name = name;
                    user.surname = surname;
                    user.profilePhotoLink = photoLink;
                    this.userDao.saveEntity(connection, user)
                        .then((facebookUser) => {
                        connection.release();
                        resolve(facebookUser);
                    }, (error) => {
                        connection.release();
                        reject(error);
                    })
                        .catch((error) => {
                        connection.release();
                        reject(error);
                    });
                }, (error) => {
                    connection.release();
                    reject(error);
                })
                    .catch((error) => {
                    connection.release();
                    reject(error);
                });
            }, reject).catch(reject);
        });
    }
    retrieveFacebookFriends(user, accessToken) {
        return new Promise((resolve, reject) => {
            let graph = new facebook_graph_1.GraphAPI(accessToken);
            user.friends = [];
            function fetchFacebookUsers(connection, nextPageToken) {
                return new Promise((resolve2, reject2) => {
                    let parameters = {
                        'fields': 'id,name',
                        'limit': 100,
                    };
                    if (nextPageToken) {
                        parameters['after'] = nextPageToken;
                    }
                    graph.getConnections('me', 'friends', parameters, (error, friendsData) => {
                        if (error) {
                            winston.warn('Failed fetch friends', error);
                            resolve2([]);
                            return;
                        }
                        let friendList = friendsData.data;
                        let facebookIds = friendList.map((friend) => { return friend.id; });
                        if (friendsData.paging && friendsData.paging.next) {
                            fetchFacebookUsers(connection, friendsData.paging.after)
                                .then((ids) => {
                                facebookIds.push(ids);
                                resolve2(facebookIds);
                            }, (error) => {
                                winston.warn('Failed fetch friends next page', error);
                                resolve2(facebookIds);
                            })
                                .catch((error) => {
                                winston.warn('Failed fetch friends next page', error);
                                resolve2(facebookIds);
                            });
                        }
                        else {
                            resolve2(facebookIds);
                        }
                    });
                });
            }
            this.userDao.getConnection()
                .then((connection) => {
                fetchFacebookUsers(connection, null)
                    .then((ids) => {
                    this.userDao.findAllFacebookIdIn(connection, ids)
                        .then((users) => {
                        user.friends = users;
                        user.friendsUpdateDate = new Date();
                        this.userDao.saveEntity(connection, user)
                            .then((user) => {
                            connection.release();
                            resolve(user.friends);
                        }, (error) => {
                            connection.release();
                            reject(error);
                        })
                            .catch((error) => {
                            connection.release();
                            reject(error);
                        });
                    }, (error) => {
                        connection.release();
                        reject(error);
                    })
                        .catch((error) => {
                        connection.release();
                        reject(error);
                    });
                }, (error) => {
                    connection.release();
                    reject(error);
                })
                    .catch((error) => {
                    connection.release();
                    reject(error);
                });
            }, reject)
                .catch(reject);
        });
    }
    getPasswordHash(password, salt) {
        let hash = crypto.createHash('sha256');
        hash.update(password);
        hash.update(salt);
        return hash.digest('hex');
    }
    generateAndSaveToken(id) {
        return new Promise((resolve, reject) => {
            this.userDao.findByIdWithConnection(id)
                .then((user) => {
                if (!user) {
                    reject('User is undefined');
                    return;
                }
                user.token = randomstring.generate(32) + new Date().getTime() + randomstring.generate(32);
                this.userDao.saveEntityWithConnection(user)
                    .then((user) => {
                    resolve(user);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    deleteUser(id) {
        return new Promise((resolve, reject) => {
            this.userDao.getConnection().then((connection) => {
                this.userDao.findById(connection, id)
                    .then((user) => {
                    if (user) {
                        user.deleted = true;
                        this.userDao.saveEntity(connection, user)
                            .then((deletedUser) => {
                            connection.release();
                            resolve(user);
                        }, (error) => {
                            connection.release();
                            reject(error);
                        })
                            .catch((error) => {
                            connection.release();
                            reject(error);
                        });
                    }
                    else {
                        connection.release();
                        resolve(null);
                    }
                }, (error) => {
                    connection.release();
                    reject(error);
                })
                    .catch((error) => {
                    connection.release();
                    reject(error);
                });
            }, reject).catch(reject);
        });
    }
    getPage(page, perPage) {
        let criteria = new Map();
        criteria.set('deleted', false);
        return this.userDao.findPageByCriteriaWithConnection(criteria, page, perPage);
    }
    authenticationMiddleware(request, response, next) {
        if (request.isAuthenticated()) {
            next();
        }
        else {
            let acceptHeader = request.header('accept');
            if (acceptHeader && acceptHeader.indexOf('application/json') >= 0) {
                response.status(401).json();
            }
            else {
                response.redirect('/admin/login');
            }
        }
    }
    authenticationAdminMiddleware(request, response, next) {
        if (request.isAuthenticated() && request.user.admin) {
            next();
        }
        else {
            let acceptHeader = request.header('accept');
            if (acceptHeader && acceptHeader.indexOf('application/json') >= 0) {
                response.status(401).json();
            }
            else {
                response.redirect('/admin/login');
            }
        }
    }
    getUserPlaceInTop(userId) {
        return this.userDao.getUserPlaceInTop(userId);
    }
    loginRegistration(request, user, type) {
        let userLogin = new index_2.default();
        userLogin.type = type;
        userLogin.user = user;
        userLogin.ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        userLogin.userAgent = request.headers['user-agent'];
        this.userLoginDao.saveEntityWithConnection(userLogin)
            .then((userLogin) => {
            winston.debug('Authorization saved successfully');
        }, (error) => {
            winston.error('Failed save authorization', error);
        }).catch((error) => {
            winston.error('Failed save authorization', error);
        });
    }
    createModel(request) {
        return new Promise((resolve, reject) => {
            let content = request.body;
            let model = {
                id: content.id || undefined,
                email: content.email,
                name: content.name,
                surname: content.surname,
                enabled: content.enabled === 'on',
                admin: content.admin === 'on'
            };
            resolve(model);
        });
    }
    validate(model, request) {
        return new Promise((resolve, reject) => {
            let validation = {
                valid: true
            };
            validation.name = model.name ? (validator.isLength(model.name, { min: 2, max: 255 }) ? undefined : 'User name length must be between 2 and 255 symbols') : undefined;
            validation.surname = model.surname ? (validator.isLength(model.surname, { min: 2, max: 255 }) ? undefined : 'User surname length must be between 2 and 255 symbols') : undefined;
            validation.email = model.email ? (validator.isEmail(model.email) ? undefined : 'Email is invalid') : undefined;
            validation.valid = ValidationHelper_1.default.isValid(validation);
            resolve(validation);
        });
    }
    transformToUserPassportModel(user) {
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            login: user.login,
            name: user.name,
            surname: user.surname,
            admin: user.admin
        };
    }
}
exports.default = UserService;
//# sourceMappingURL=index.js.map