"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Badge {
    constructor() {
        this.published = false;
        this.deleted = false;
    }
    getIdFieldName() {
        return 'id';
    }
    getTableName() {
        return Badge.tableName;
    }
    getFieldsMapping() {
        return Badge.fieldsMap;
    }
    getFieldsRelation() {
        return Badge.fieldsRelation;
    }
    getFieldsManyToMany() {
        return new Map();
    }
}
Badge.tableName = "badge";
Badge.fieldsRelation = ['imageActivate', 'imageDeactivate'];
Badge.fieldsMap = new Map([
    ['id', 'id'],
    ['name', 'name'],
    ['image_activate_fk', 'imageActivate'],
    ['image_deactivate_fk', 'imageDeactivate'],
    ['congratulation_text', 'congratulationText'],
    ['aim_text', 'aimText'],
    ['published', 'published'],
    ['deleted', 'deleted'],
    ['achievement_function_name', 'achievementFunctionName'],
    ['creation_date', 'creationDate'],
    ['update_date', 'updateDate']
]);
exports.default = Badge;
//# sourceMappingURL=index.js.map