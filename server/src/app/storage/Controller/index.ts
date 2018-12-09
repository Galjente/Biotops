"use strict";
import {Controller, DEFAULT_PER_PAGE} from "../../system/Controller";
import {Application, Router, Request, Response, NextFunction} from "express";
import {RequestWithLocale} from "../../system/RequestWithLocale";
import StorageService from "../Service/StorageService/index";
import UserService from "../../user/Service/UserService/index";

export default class StorageController implements Controller {

    private static STORAGE_PAGE_MENU_KEY:string = "admin_storage";

    private storageService: StorageService;
    private userService: UserService;

    constructor(services: Map<string, any>) {
        this.storageService = services.get('storageService');
        this.userService = services.get('userService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/admin/storage',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.storagePage(request, response)});

        router.get('/storage/image/:hash', (request: Request & RequestWithLocale, response: Response) => {this.getImageContentByHash(request, response)});

        router.get('/admin/storage/image/list/:page',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getImagePage(request, response)});
        router.post('/admin/storage/image/save',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            this.storageService.getImageRequestHandler('image'),
            (request: Request & RequestWithLocale, response: Response) => {this.saveImage(request, response)});
        router.delete('/admin/storage/image/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.deleteImage(request, response)});
        router.get('/admin/storage/image/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getImage(request, response)});
    }

    postInitialization(): void {}

    storagePage(request: Request & RequestWithLocale, response: Response):void {
       response.render('storage/template/image', {
           menuKey: StorageController.STORAGE_PAGE_MENU_KEY
       });
    }

    saveImage(request: Request & RequestWithLocale, response: Response):void {
        this.storageService.createModel(request)
            .then(
                (imageModel) => {
                    this.storageService.validate(imageModel, request)
                        .then(
                            (imageValidationModel)=> {
                                this.storageService.saveImage(imageModel)
                                    .then(
                                        (image)=> {
                                            response.status(200).json(image);
                                        },
                                        (error) => {
                                            response.status(500).json(error);
                                        }
                                    )
                                    .catch((error) => {
                                        response.status(500).json(error);
                                    });
                            },
                            (error) => {
                                response.status(500).json(error);
                            }
                        )
                        .catch((error) => {
                            response.status(500).json(error);
                        });
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getImagePage(request: Request & RequestWithLocale, response: Response):void {
        let page: number = parseInt(request.params.page);
        let perPage: number = parseInt(request.cookies['imagePerPage']) || DEFAULT_PER_PAGE;
        if (isNaN(page)) {
            response.status(400).json();
            return;
        }

        if (perPage != request.cookies.imagePerPage) {
            response.cookie('imagePerPage', perPage);
        }

        this.storageService.getImagePage(page, perPage)
            .then((restPage) => {
                response.status(200).json(restPage);
            }, (error) => {
                response.status(500).json(error);
            }).catch((error) => {
            response.status(500).json(error);
        });
    }

    deleteImage(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }

        this.storageService.deleteImage(id)
            .then(
                (image) => {
                    if (image) {
                        response.status(200).json(image);
                    } else {
                        response.status(404).json();
                    }
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getImage(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }

        this.storageService.getImage(id)
            .then(
                (image) => {
                    if (image) {
                        response.status(200).json(image);
                    } else {
                        response.status(404).json();
                    }
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getImageContentByHash(request: Request & RequestWithLocale, response: Response):void {
        let hash:string = request.params.hash;

        if (!hash) {
            response.status(400).json();
            return;
        }

        this.storageService.getImageContentByHash(hash)
            .then(
                (imageResponseModel) => {
                    if (imageResponseModel) {
                        response.writeHead(200, {'Content-Type': imageResponseModel.contentType});
                        response.end(imageResponseModel.content, 'binary');
                    } else {
                        response.status(404).json();
                    }
                },
                (error) => {
                    response.status(500).json(error);
                }
            ).catch((error) => {
                response.status(500).json(error);
            });
    }
}