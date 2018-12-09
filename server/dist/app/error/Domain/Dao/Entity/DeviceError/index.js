'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class DeviceError {
    constructor() {
        this.deleted = false;
    }
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return DeviceError.TABLE_NAME;
    }
    getFieldsMapping() {
        return DeviceError.FIELDS_MAP;
    }
    getFieldsRelation() {
        return DeviceError.FIELDS_RELATION;
    }
    getFieldsManyToMany() {
        return new Map();
    }
}
DeviceError.TABLE_NAME = "device_error";
DeviceError.FIELDS_RELATION = ['user'];
DeviceError.FIELDS_MAP = new Map([
    ['id', 'id'],
    ['user_fk', 'user'],
    ['os_name', 'osName'],
    ['os_version', 'osVersion'],
    ['message', 'message'],
    ['class_name', 'className'],
    ['deleted', 'deleted'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = DeviceError;
//# sourceMappingURL=index.js.map