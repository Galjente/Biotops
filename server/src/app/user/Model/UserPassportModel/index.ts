'use strict';

export default interface UserPassportModel {
    id: number;
    login?: string;
    name?: string;
    surname?: string;
    admin: boolean;
}