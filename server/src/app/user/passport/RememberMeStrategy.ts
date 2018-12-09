"use strict";
import {Strategy} from 'passport-strategy';
import express = require("express");

interface VerifyFunction {
    (token: string, done: (error: Error, user?: any) => void):void;
}

interface CookieOptions {
    key:    string
}

export default class RememberMeStrategy implements Strategy {

    public name: string = 'remember_me';

    private cookieKey: string = 'remember_me';
    private verifyFunction: VerifyFunction;

    constructor(verifyFunction: VerifyFunction, cookieOptions?: CookieOptions) {
        if (!verifyFunction) {
            throw new Error('remember me cookie authentication strategy requires a verify function');
        }

        this.verifyFunction = verifyFunction;

        if (cookieOptions && cookieOptions.key) {
            this.cookieKey = cookieOptions.key;
        }
    }

    authenticate(request: express.Request, options?: any): void {
        if (request.isAuthenticated()) {
            this.pass();
            return;
        }

        let token = request.cookies[this.cookieKey];

        if (!token) {
            this.pass();
            return;
        }
        this.verifyFunction(token, (error, user) => {
            if (error) {
                this.error(error);
            } else if (!user) {
                this.pass();
            } else {
                this.success(user, null);
            }
        });
    }


    fail(challenge: any, status: number): void;
    fail(status: number): void;
    fail(challenge: any, status?: any) {}

    success(user: any, info: any): void {}
    redirect(url: string, status?: number): void {}
    pass(): void {}
    error(err: Error): void {}
}