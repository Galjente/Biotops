import * as express from 'express';

export const DEFAULT_PER_PAGE:number = 10;

export interface Controller {
    init(express: express.Application): void;
    router(router: express.Router): void;
    postInitialization(): void;
}
