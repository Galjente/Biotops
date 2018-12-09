"use strict";
import {Controller} from "../../system/Controller";
import {Application, Router, Request, Response, NextFunction} from "express";
import {RequestWithLocale} from "../../system/RequestWithLocale";
import UserService from "../../user/Service/UserService/index";

export default class AdminHomeController implements Controller {

    private static ADMIN_HOME_PAGE_MENU_KEY:string = "admin_home";

    private userService:UserService;

    constructor(services: Map<string, any>) {
        this.userService = services.get('userService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/admin',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.adminHomePage(request, response)});
    }

    postInitialization(): void {}

    adminHomePage(request: Request & RequestWithLocale, response: Response):void {
        response.render('adminhome/template/home', {
            menuKey: AdminHomeController.ADMIN_HOME_PAGE_MENU_KEY
        });
    }

}