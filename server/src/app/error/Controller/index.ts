"use strict";
import {Application, Router, Request, Response} from "express";
import {Controller} from "../../system/Controller";
import {RequestWithLocale} from "../../system/RequestWithLocale";

export default class ErrorController implements Controller {

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/404', (request: Request & RequestWithLocale, response: Response) => {this.error404(request, response)});
        router.get('/500', (request: Request & RequestWithLocale, response: Response) => {this.error500(request, response)});
    }

    postInitialization(): void {}

    error404(request: Request & RequestWithLocale, response: Response) {
        response.status(404).json();
    }

    error500(request: Request & RequestWithLocale, response: Response) {
        response.status(500).json();
    }
}