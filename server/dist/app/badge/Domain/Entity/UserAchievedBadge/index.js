"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAchievedBadge {
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return UserAchievedBadge.tableName;
    }
    getFieldsMapping() {
        return UserAchievedBadge.fieldsMap;
    }
    getFieldsRelation() {
        return UserAchievedBadge.FIELDS_RELATION;
    }
    getFieldsManyToMany() {
        return new Map();
    }
}
UserAchievedBadge.tableName = "user_achieved_badge";
UserAchievedBadge.FIELDS_RELATION = ['user', 'badge', 'receiptPlace'];
UserAchievedBadge.fieldsMap = new Map([
    ['id', 'id'],
    ['user_fk', 'user'],
    ['badge_fk', 'badge'],
    ['receipt_place_fk', 'receiptPlace'],
    ['latitude', 'latitude'],
    ['longitude', 'longitude'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = UserAchievedBadge;
//# sourceMappingURL=index.js.map