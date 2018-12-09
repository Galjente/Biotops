'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDDao_1 = require("../../../../system/CRUDDao");
const index_1 = require("../../Entity/UserLogin/index");
class UserLoginDao extends CRUDDao_1.CRUDDao {
    constructor(daos) {
        super(index_1.default.TABLE_NAME);
        this.userDao = daos.get('userDao');
    }
    migrate(migrationDao) { }
    createEntity() {
        return new index_1.default();
    }
    findAllIn(connection, ids) {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then((userLoginList) => {
                this.attachUserToArray(connection, userLoginList)
                    .then(() => {
                    resolve(userLoginList);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllByCriteria(connection, criteria, searchFields) {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria, searchFields)
                .then((userLoginList) => {
                this.attachUserToArray(connection, userLoginList)
                    .then(() => {
                    resolve(userLoginList);
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
                this.attachUserToArray(connection, page.content)
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
                this.attachUserToArray(connection, page.content)
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
                this.attachUser(connection, user)
                    .then(() => {
                    resolve(user);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    attachUserToArray(connection, userLoginList) {
        let promises = userLoginList.map((userLogin) => {
            return this.attachUser(connection, userLogin);
        });
        return Promise.all(promises);
    }
    attachUser(connection, userLogin) {
        if (!userLogin) {
            return Promise.resolve(userLogin);
        }
        return new Promise((resolve, reject) => {
            if (userLogin.user) {
                this.userDao.findById(connection, userLogin.user)
                    .then((user) => {
                    userLogin.user = user;
                    resolve(userLogin);
                }, reject).catch(reject);
            }
            else {
                resolve(userLogin);
            }
        });
    }
}
exports.default = UserLoginDao;
//# sourceMappingURL=index.js.map