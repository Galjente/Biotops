'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDDao_1 = require("../../../../system/CRUDDao");
const index_1 = require("../Entity/DeviceError/index");
class DeviceErrorDao extends CRUDDao_1.CRUDDao {
    constructor(daos) {
        super(index_1.default.TABLE_NAME);
        this.userDao = daos.get('userDao');
    }
    migrate(migrationDao) { }
    createEntity() {
        return new index_1.default();
    }
    findAll(connection) {
        return new Promise((resolve, reject) => {
            super.findAll(connection)
                .then((errors) => {
                this.attachUserToArray(connection, errors)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllIn(connection, ids) {
        return new Promise((resolve, reject) => {
            super.findAllIn(connection, ids)
                .then((errors) => {
                this.attachUserToArray(connection, errors)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    findAllByCriteria(connection, criteria) {
        return new Promise((resolve, reject) => {
            super.findAllByCriteria(connection, criteria)
                .then((errors) => {
                this.attachUserToArray(connection, errors)
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
                this.attachUserToArray(connection, page.content)
                    .then((errors) => {
                    resolve(page);
                }, reject).catch(reject);
            }, reject).catch(reject);
        });
    }
    findPage(connection, page, perPage) {
        return new Promise((resolve, reject) => {
            super.findPage(connection, page, perPage)
                .then((page) => {
                this.attachUserToArray(connection, page.content)
                    .then((errors) => {
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
                .then((error) => {
                this.attachUser(connection, error)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    attachUserToArray(connection, deviceErrors) {
        let promises = deviceErrors.map((deviceError) => {
            return this.attachUser(connection, deviceError);
        });
        return Promise.all(promises);
    }
    attachUser(connection, deviceError) {
        return new Promise((resolve, reject) => {
            if (deviceError.user) {
                this.userDao.findById(connection, deviceError.user)
                    .then((user) => {
                    deviceError.user = user;
                    resolve(deviceError);
                }, reject).catch(reject);
            }
            else {
                resolve(deviceError);
            }
        });
    }
}
exports.default = DeviceErrorDao;
//# sourceMappingURL=index.js.map