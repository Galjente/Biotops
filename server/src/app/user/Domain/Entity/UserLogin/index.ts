'use strict';
import {Entity, ManyToManyProperty} from "../../../../system/Entity";
import User from "../User/index";

export default class UserLogin implements Entity {

    public static TABLE_NAME: string = "user_login";

    private static FIELDS_RELATION: Array<string> = ['user'];
    private static MANY_TO_MANY_MAP: Map<string, ManyToManyProperty> = new Map();

    private static FIELDS_MAP: Map<string, string> = new Map([
        ['id', 'id'],
        ['type', 'type'],
        ['user_fk', 'user'],
        ['ip', 'ip'],
        ['user_agent', 'userAgent'],
        ['creation_date', 'creationDate'],
        ['update_date', 'updateDate']
    ]);

    public id:number;
    public type:string;
    public user:User | number;
    public ip:string;
    public userAgent:string;
    public creationDate:Date;
    public updateDate:Date;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return UserLogin.TABLE_NAME;
    }

    getFieldsMapping(): Map<string, string> {
        return UserLogin.FIELDS_MAP;
    }

    getFieldsRelation(): Array<string> {
        return UserLogin.FIELDS_RELATION;
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return UserLogin.MANY_TO_MANY_MAP;
    }

}