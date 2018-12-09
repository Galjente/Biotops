'use strict';
import {Entity, ManyToManyProperty} from "../../../../../system/Entity";
import User from "../../../../../user/Domain/Entity/User";

export default class DeviceError implements Entity {

    public static TABLE_NAME: string = "device_error";

    private static FIELDS_RELATION: Array<string> = ['user'];

    private static FIELDS_MAP: Map<string, string> = new Map([
        ['id', 'id'],
        ['user_fk', 'user'],
        ['os_name', 'osName'],
        ['os_version', 'osVersion'],
        ['message', 'message'],
        ['class_name', 'className'],
        ['deleted', 'deleted'],
        ['creation_date', 'creationDate'],
        ['update_date', 'updateDate']
    ]);

    public id: number;
    public user: number | User;
    public osName: string;
    public osVersion: string;
    public message: string;
    public className: string;
    public deleted:boolean = false;
    public creationDate:Date;
    public updateDate:Date;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return DeviceError.TABLE_NAME;
    }

    getFieldsMapping(): Map<string, string> {
        return DeviceError.FIELDS_MAP;
    }

    getFieldsRelation(): Array<string> {
        return DeviceError.FIELDS_RELATION;
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return new Map();
    }
}