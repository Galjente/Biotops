"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlaceCategory {
    constructor() {
        this.published = true;
        this.deleted = false;
    }
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return PlaceCategory.tableName;
    }
    getFieldsMapping() {
        return PlaceCategory.fieldsMap;
    }
    getFieldsRelation() {
        return PlaceCategory.fieldsRelation;
    }
    getFieldsManyToMany() {
        return new Map();
    }
}
PlaceCategory.FAUNA_KEY = 'fauna_1';
PlaceCategory.FLORA_KEY = 'flora_1';
PlaceCategory.WATER_KEY = 'water_1';
PlaceCategory.GEO_KEY = 'geo_1';
PlaceCategory.TOWER_KEY = 'tower_1';
PlaceCategory.MOUNT_KEY = 'mount_1';
PlaceCategory.tableName = "place_category";
PlaceCategory.fieldsRelation = ['icon'];
PlaceCategory.fieldsMap = new Map([
    ['id', 'id'],
    ['name', 'name'],
    ['icon_fk', 'icon'],
    ['published', 'published'],
    ['deleted', 'deleted'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = PlaceCategory;
//# sourceMappingURL=index.js.map