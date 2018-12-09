"use strict";
import {Controller} from "../../system/Controller";
import {Application, Router, Request, Response} from "express";
import {RequestWithLocale} from "../../system/RequestWithLocale";

export default class HomeController implements Controller {

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/', (request: Request & RequestWithLocale, response: Response) => {this.mainPage(request, response)});
        router.get('/index', (request: Request & RequestWithLocale, response: Response) => {this.mainPage(request, response)});
        router.get('/index.html', (request: Request & RequestWithLocale, response: Response) => {this.mainPage(request, response)});
        router.get('/privacy-policy', (request: Request & RequestWithLocale, response: Response) => {this.privacyPolicyPage(request, response)});
        router.get('/privacy-policy.html', (request: Request & RequestWithLocale, response: Response) => {this.privacyPolicyPage(request, response)});
        router.get('/terms-and-conditions', (request: Request & RequestWithLocale, response: Response) => {this.termsAndConditionsPage(request, response)});
        router.get('/terms-and-conditions.html', (request: Request & RequestWithLocale, response: Response) => {this.termsAndConditionsPage(request, response)});
    }

    postInitialization(): void {}

    mainPage(request: Request & RequestWithLocale, response: Response):void {
        response.render('home/template/home', {
            layout: 'system/template/external-layout'
        });
    }

    privacyPolicyPage(request: Request & RequestWithLocale, response: Response):void {
        response.render('home/template/privacyPolicy', {
            layout: 'system/template/external-layout'
        });
    }

    termsAndConditionsPage(request: Request & RequestWithLocale, response: Response):void {
        response.render('home/template/termsAndConditions', {
            layout: 'system/template/external-layout'
        });
    }
}
