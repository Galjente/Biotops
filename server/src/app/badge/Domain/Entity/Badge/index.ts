"use strict";
import {Entity, ManyToManyProperty} from "../../../../system/Entity";
import Image from "../../../../storage/Domain/Entity/Image/index";

export default class Badge implements Entity {

    public static tableName = "badge";

    private static fieldsRelation: Array<string> = ['imageActivate', 'imageDeactivate'];

    private static fieldsMap: Map<string, string> = new Map([
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

    public id:number;
    public name:string;
    public congratulationText:string;
    public aimText:string;
    public imageActivate: Image|number;
    public imageDeactivate: Image|number;
    public published:boolean = false;
    public deleted:boolean = false;
    public achievementFunctionName: string;
    public creationDate: Date;
    public updateDate: Date;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return Badge.tableName;
    }

    getFieldsMapping(): Map<string, string> {
        return Badge.fieldsMap;
    }

    getFieldsRelation(): Array<string> {
        return Badge.fieldsRelation;
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return new Map();
    }
}