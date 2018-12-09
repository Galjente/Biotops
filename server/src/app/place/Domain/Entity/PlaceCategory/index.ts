"use strict";
import {Entity, ManyToManyProperty} from "../../../../system/Entity";
import Image from "../../../../storage/Domain/Entity/Image/index";

export default class PlaceCategory implements Entity {

    public static FAUNA_KEY = 'fauna_1';
    public static FLORA_KEY = 'flora_1';
    public static WATER_KEY = 'water_1';
    public static GEO_KEY = 'geo_1';
    public static TOWER_KEY = 'tower_1';
    public static MOUNT_KEY = 'mount_1';

    public static tableName = "place_category";

    private static fieldsRelation: Array<string> = ['icon'];

    private static fieldsMap: Map<string, string> = new Map([
        ['id', 'id'],
        ['name', 'name'],
        ['icon_fk', 'icon'],
        ['published', 'published'],
        ['deleted', 'deleted'],
        ['creation_date', 'creationDate'],
        ['update_date', 'updateDate']
    ]);

    public id:number;
    public name:string;
    public icon:Image | number;
    public published:boolean = true;
    public deleted:boolean = false;
    public creationDate: Date;
    public updateDate: Date;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return PlaceCategory.tableName;
    }

    getFieldsMapping(): Map<string, string> {
        return PlaceCategory.fieldsMap;
    }

    getFieldsRelation(): Array<string> {
        return PlaceCategory.fieldsRelation;
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return new Map();
    }
}