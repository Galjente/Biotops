"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeviceErrorService {
    constructor(services, daos) {
        this.deviceErrorDao = daos.get('deviceErrorDao');
        this.userService = services.get('userService');
    }
    save(errorDeviceModel) {
        return this.deviceErrorDao.saveWithConnection({
            model: errorDeviceModel,
            onNewEntity: (entity, model) => { },
            onUpdateEntity: (entity, model) => {
                entity.user = model.user;
                entity.osName = model.osName;
                entity.osVersion = model.osVersion;
                entity.message = model.message;
                entity.className = model.className;
            }
        });
    }
    createModel(request) {
        return new Promise((resolve, reject) => {
            let content = request.body;
            let model = {
                id: content.id || undefined,
                osName: content.os || '',
                osVersion: content.version || '',
                message: content.message || '',
                className: content.className || '',
                user: null,
            };
            if (request.user) {
                this.userService.getById(request.user.id)
                    .then((user) => {
                    model.user = user;
                    resolve(model);
                }, reject)
                    .catch(reject);
            }
            else {
                resolve(model);
            }
        });
    }
    validate(model, request) {
        return new Promise((resolve, reject) => {
            let validation = {
                valid: true
            };
            //validation.valid = ValidationHelper.isValid(validation);
            resolve(validation);
        });
    }
}
exports.default = DeviceErrorService;
//# sourceMappingURL=index.js.map