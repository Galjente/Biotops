"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Image {
    constructor() {
        this.deletable = true;
        this.deleted = false;
    }
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return Image.tableName;
    }
    getFieldsMapping() {
        return Image.fieldsMap;
    }
    getFieldsRelation() {
        return Image.fieldsRelation;
    }
    getFieldsManyToMany() {
        return new Map();
    }
}
Image.TYPE_IMAGE_PERMANENT = "image_permanent";
Image.TYPE_IMAGE = "image";
Image.tableName = "image";
Image.fieldsRelation = [];
Image.fieldsMap = new Map([
    ['id', 'id'],
    ['type', 'type'],
    ['original_name', 'originalName'],
    ['extension', 'extension'],
    ['hash', 'hash'],
    ['path', 'path'],
    ['deletable', 'deletable'],
    ['deleted', 'deleted'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = Image;
//# sourceMappingURL=index.js.map