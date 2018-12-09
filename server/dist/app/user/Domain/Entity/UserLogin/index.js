'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class UserLogin {
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return UserLogin.TABLE_NAME;
    }
    getFieldsMapping() {
        return UserLogin.FIELDS_MAP;
    }
    getFieldsRelation() {
        return UserLogin.FIELDS_RELATION;
    }
    getFieldsManyToMany() {
        return UserLogin.MANY_TO_MANY_MAP;
    }
}
UserLogin.TABLE_NAME = "user_login";
UserLogin.FIELDS_RELATION = ['user'];
UserLogin.MANY_TO_MANY_MAP = new Map();
UserLogin.FIELDS_MAP = new Map([
    ['id', 'id'],
    ['type', 'type'],
    ['user_fk', 'user'],
    ['ip', 'ip'],
    ['user_agent', 'userAgent'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = UserLogin;
//# sourceMappingURL=index.js.map