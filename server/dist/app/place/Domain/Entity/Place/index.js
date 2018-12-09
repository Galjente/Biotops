"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Place {
    constructor() {
        this.deleted = false;
        this.published = true;
    }
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return Place.TABLE_NAME;
    }
    getFieldsMapping() {
        return Place.fieldsMap;
    }
    getFieldsRelation() {
        return ['category'];
    }
    getFieldsManyToMany() {
        return Place.manyToManyMap;
    }
}
Place.TABLE_NAME = "place";
Place.manyToManyMap = new Map([
    ['categories', {
            table: 'place_place_category',
            parentKey: 'place_fk',
            childKey: 'place_category_fk'
        }],
    ['images', {
            table: 'place_image',
            parentKey: 'place_fk',
            childKey: 'image_fk'
        }]
]);
Place.fieldsMap = new Map([
    ['id', 'id'],
    ['name', 'name'],
    ['address', 'address'],
    ['region', 'region'],
    ['latitude', 'latitude'],
    ['longitude', 'longitude'],
    ['entrance_fee', 'entranceFee'],
    ['note', 'note'],
    ['short_description', 'shortDescription'],
    ['description', 'description'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate'],
    ['published', 'published'],
    ['deleted', 'deleted']
]);
exports.default = Place;
//# sourceMappingURL=index.js.map