"use strict";
import {Entity, ManyToManyProperty} from "../../../../system/Entity";

export default class Image implements Entity {

    public static TYPE_IMAGE_PERMANENT = "image_permanent";
    public static TYPE_IMAGE = "image";
    
    public static tableName = "image";

    private static fieldsRelation: Array<string> = [];

    private static fieldsMap: Map<string, string> = new Map([
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

    public id:number;
    public type:string;
    public originalName:string;
    public extension:string;
    public hash:string;
    public path:string;
    public deletable:boolean = true;
    public deleted:boolean = false;
    public creationDate: Date;
    public updateDate: Date;
    public uri:string;
    
    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return Image.tableName;
    }

    getFieldsMapping(): Map<string, string> {
        return Image.fieldsMap;
    }

    getFieldsRelation(): string[] {
        return Image.fieldsRelation;
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return new Map();
    }
}