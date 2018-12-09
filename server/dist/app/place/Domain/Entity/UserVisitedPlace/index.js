"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserVisitedPlace {
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return UserVisitedPlace.TABLE_NAME;
    }
    getFieldsMapping() {
        return UserVisitedPlace.fieldsMap;
    }
    getFieldsRelation() {
        return ['user', 'place'];
    }
    getFieldsManyToMany() {
        return new Map();
    }
}
UserVisitedPlace.TABLE_NAME = 'user_visited_place';
UserVisitedPlace.fieldsMap = new Map([
    ['id', 'id'],
    ['user_fk', 'user'],
    ['place_fk', 'place'],
    ['latitude', 'latitude'],
    ['longitude', 'longitude'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = UserVisitedPlace;
//# sourceMappingURL=index.js.map