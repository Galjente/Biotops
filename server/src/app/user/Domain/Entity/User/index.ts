"use strict";
import {Entity, ManyToManyProperty} from "../../../../system/Entity";

export default class User implements Entity {

    public static TABLE_NAME: string = "user";

    private static MANY_TO_MANY_MAP: Map<string, ManyToManyProperty> = new Map([
        ['friends', {
            table: 'user_friend',
            parentKey: 'user_fk',
            childKey: 'friend_fk',
        }]
    ]);

    private static FIELDS_MAP: Map<string, string> = new Map([
        ['id', 'id'],
        ['name', 'name'],
        ['surname', 'surname'],
        ['login', 'login'],
        ['password', 'password'],
        ['secret', 'secret'],
        ['token', 'token'],
        ['facebook_id', 'facebookId'],
        ['profile_photo_link', 'profilePhotoLink'],
        ['admin', 'admin'],
        ['enabled', 'enabled'],
        ['deleted', 'deleted'],
        ['friends_update_date', 'friendsUpdateDate'],
        ['creation_date', 'creationDate'],
        ['update_date', 'updateDate']
    ]);

    public id:number;
    public name:string;
    public surname:string;
    public login:string;
    public password:string;
    public secret:string;
    public token:string;
    public facebookId:string;
    public profilePhotoLink:string;
    public admin:boolean = false;
    public enabled:boolean = true;
    public deleted:boolean = false;
    public friendsUpdateDate:Date;
    public creationDate:Date;
    public updateDate:Date;
    public friends: Array<User|number>;

    getIdFieldName(): string {
        return 'id';
    }

    getTableName(): string {
        return User.TABLE_NAME;
    }

    getFieldsMapping(): Map<string, string> {
        return User.FIELDS_MAP;
    }

    getFieldsRelation(): Array<string> {
        return [];
    }

    getFieldsManyToMany(): Map<string, ManyToManyProperty> {
        return User.MANY_TO_MANY_MAP;
    }

}