'use strict';

export default interface UserApiModel {
    id: number;
    name?: string;
    surname?: string;
    lastBadge?: any;
    friends: Array<UserApiModel>;
}