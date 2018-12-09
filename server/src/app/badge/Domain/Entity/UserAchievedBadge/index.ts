"use strict";
import {Entity, ManyToManyProperty} from "../../../../system/Entity";
import User from "../../../../user/Domain/Entity/User/index";
import Badge from "../Badge/index";
import Place from "../../../../place/Domain/Entity/Place/index";

export default class UserAchievedBadge implements Entity {

    public static tableName = "user_achieved_badge";

    private static FIELDS_RELATION:Array<string> = ['user', 'badge', 'receiptPlace'];

    private static fieldsMap: Map<string, string> = new Map([
        ['id', 'id'],
        ['user_fk', 'user'],
        ['badge_fk', 'badge'],
        ['receipt_place_fk', 'receiptPlace'],
        ['latitude', 'latitude'],
        ['longitude', 'longitude'],
        ['creation_date', 'creationDate'],
        ['update_date', 'updateDate']
    ]);

    public id: number;
    public user: User | number;
    public badge: Badge | number;
    public receiptPlace: Place | number;
    public latitude: number;
    public longitude: number;
    public creationDate: Date;
    public updateDate: Date;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return UserAchievedBadge.tableName;
    }

    getFieldsMapping(): Map<string, string> {
        return UserAchievedBadge.fieldsMap;
    }

    getFieldsRelation(): Array<string> {
        return UserAchievedBadge.FIELDS_RELATION;
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return new Map();
    }
}