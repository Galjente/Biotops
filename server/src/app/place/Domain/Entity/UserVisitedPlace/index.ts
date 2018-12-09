"use strict";
import {Entity, ManyToManyProperty} from "../../../../system/Entity";
import User from "../../../../user/Domain/Entity/User/index";
import Place from "../Place/index";

export default class UserVisitedPlace implements Entity {

    public static TABLE_NAME = 'user_visited_place';

    private static fieldsMap: Map<string, string> = new Map([
        ['id', 'id'],
        ['user_fk', 'user'],
        ['place_fk', 'place'],
        ['latitude', 'latitude'],
        ['longitude', 'longitude'],
        ['creation_date', 'creationDate'],
        ['update_date', 'updateDate']
    ]);

    public id: number;
    public user: User|number;
    public place: Place|number;
    public latitude: number;
    public longitude: number;
    public creationDate: Date;
    public updateDate: Date;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return UserVisitedPlace.TABLE_NAME;
    }

    getFieldsMapping(): Map<string, string> {
        return UserVisitedPlace.fieldsMap;
    }

    getFieldsRelation(): Array<string> {
        return ['user', 'place'];
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return new Map();
    }
}