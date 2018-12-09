"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor() {
        this.admin = false;
        this.enabled = true;
        this.deleted = false;
    }
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return User.TABLE_NAME;
    }
    getFieldsMapping() {
        return User.FIELDS_MAP;
    }
    getFieldsRelation() {
        return [];
    }
    getFieldsManyToMany() {
        return User.MANY_TO_MANY_MAP;
    }
}
User.TABLE_NAME = "user";
User.MANY_TO_MANY_MAP = new Map([
    ['friends', {
            table: 'user_friend',
            parentKey: 'user_fk',
            childKey: 'friend_fk',
        }]
]);
User.FIELDS_MAP = new Map([
    ['id', 'id'],
    ['name', 'name'],
    ['surname', 'surname'],
    ['login', 'login'],
    ['password', 'password'],
    ['secret', 'secret'],
    ['token', 'token'],
    ['facebook_id', 'facebookId'],
    ['profile_photo_link', 'profilePhotoLink'],
    ['admin', 'admin'],
    ['enabled', 'enabled'],
    ['deleted', 'deleted'],
    ['friends_update_date', 'friendsUpdateDate'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = User;
//# sourceMappingURL=index.js.map