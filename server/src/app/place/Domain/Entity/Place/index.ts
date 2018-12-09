"use strict";
import {Entity, ManyToManyProperty} from "../../../../system/Entity";
import PlaceCategory from "../PlaceCategory/index";
import Image from "../../../../storage/Domain/Entity/Image/index";

export default class Place implements Entity {

    public static TABLE_NAME = "place";

    private static manyToManyMap: Map<string, ManyToManyProperty> = new Map([
        ['categories', {
            table:      'place_place_category',
            parentKey:  'place_fk',
            childKey:   'place_category_fk'
        }],
        ['images', {
            table: 'place_image',
            parentKey: 'place_fk',
            childKey: 'image_fk'
        }]
    ]);

    private static fieldsMap: Map<string, string> = new Map([
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

    public id:number;
    public name:string;
    public address:string;
    public region:string;
    public latitude:number;
    public longitude:number;
    public entranceFee:number;
    public note:string;
    public shortDescription:string;
    public description:string;
    public creationDate: Date;
    public updateDate: Date;
    public categories: Array<PlaceCategory|number>;
    public images: Array<Image|number>;
    public deleted: boolean = false;
    public published: boolean = true;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return Place.TABLE_NAME;
    }

    getFieldsMapping(): Map<string, string> {
        return Place.fieldsMap;
    }

    getFieldsRelation(): Array<string> {
        return ['category'];
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return Place.manyToManyMap;
    }
}