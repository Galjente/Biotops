"use strict";
import {Controller, DEFAULT_PER_PAGE} from "../../../system/Controller";
import {Application, Router, Request, Response, NextFunction} from "express";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import PlaceService, {ApiPlaceModel} from "../../Service/PlaceService/index";
import PlaceCategoryService from "../../Service/PlaceCategoryService/index";
import UserService from "../../../user/Service/UserService/index";
import * as winston from "winston";
import StorageService from "../../../storage/Service/StorageService/index";
import * as stream from 'stream';
import {Workbook, Cell, Row, Worksheet} from "exceljs";
import PlaceExcelService from "../../Service/PlaceExcelService/index";

export default class PlaceController implements Controller {

    public static PLACES_PAGE_MENU_KEY:string = "admin_places";

    private placeService:PlaceService;
    private placeCategoryService:PlaceCategoryService;
    private userService: UserService;
    private storageService: StorageService;
    private placeExcelService: PlaceExcelService;

    constructor(services: Map<string, any>) {
        this.userService = services.get('userService');
        this.placeService = services.get('placeService');
        this.storageService = services.get('storageService');
        this.placeCategoryService = services.get('placeCategoryService');
        this.placeExcelService = services.get('placeExcelService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/admin/places',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.placesPage(request, response)});


        router.post('/admin/place/save',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.savePlace(request, response)});
        router.post('/admin/place/excel/save',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            this.storageService.getImageRequestHandler('xlsxPlaces'),
            (request: Request & RequestWithLocale, response: Response) => {this.saveExcelPlace(request, response)});
        router.get('/admin/place/list/:page',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getPlacePage(request, response)});
        router.get('/admin/place/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getPlace(request, response)});
        router.delete('/admin/place/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.deletePlace(request, response)});

    }

    postInitialization(): void {}

    placesPage(request: Request & RequestWithLocale, response: Response):void {
        this.placeCategoryService.getAll()
            .then(
                (placeCategories) => {
                    response.render('place/template/places', {
                        menuKey: PlaceController.PLACES_PAGE_MENU_KEY,
                        subMenuKey: PlaceController.PLACES_PAGE_MENU_KEY,
                        placeCategories: placeCategories
                    });
                },
                (error) => {
                    winston.error('Failed load places page: ' + error);
                    response.redirect('/500');
                }
            )
            .catch((error) => {
                winston.error('Failed load places page: ' + error);
                response.redirect('/500');
            });
    }

    saveExcelPlace(request: Request & RequestWithLocale, response: Response):void {
        this.placeExcelService.parseExcelFile(request.file.buffer)
            .then(
                () => {
                    response.status(200).json({});
                },
                (error) => {
                    winston.error('Failed process Excel', error);
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                winston.error('Failed process Excel', error);
                response.status(500).json(error);
            });
    }

    savePlace(request: Request & RequestWithLocale, response: Response):void {
        this.placeService.createModel(request)
            .then((placeModel) => {
                this.placeService.validate(placeModel, request)
                    .then((placeModelValidation)=> {
                        if (placeModelValidation.valid) {
                            this.placeService.save(placeModel)
                                .then((badge) => {
                                    response.status(200).json(badge);
                                }, (error) => {
                                    response.status(500).json(error);
                                    winston.error(error);
                                })
                                .catch((error) => {
                                    response.status(500).json(error);
                                    winston.error(error);
                                });
                        } else {
                            response.status(400).json(placeModelValidation);
                        }
                    })
                    .catch((error) => {
                        response.status(500).json(error);
                        winston.error(error);
                    });
            }, (error) => {
                response.status(500).json(error);
                winston.error(error);
            })
            .catch((error) => {
                response.status(500).json(error);
                winston.error(error);
            });
    }

    getPlace(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }

        this.placeService.getPlace(id)
            .then((place) => {
                if (place) {
                    response.status(200).json(place);
                } else {
                    response.status(404).json();
                }
            }, (error) => {
                winston.error(error);
                response.status(500).json(error);
            })
            .catch((error) => {
                winston.error(error);
                response.status(500).json(error);
            });
    }

    getPlacePage(request: Request & RequestWithLocale, response: Response):void {
        let page: number = parseInt(request.params.page);
        let perPage: number = parseInt(request.cookies['placePerPage']) || DEFAULT_PER_PAGE;
        if (isNaN(page)) {
            response.status(400).json();
            return;
        }

        if (perPage != request.cookies.placePerPage) {
            response.cookie('placePerPage', perPage);
        }

        this.placeService.getPage(page, perPage)
            .then((restPage) => {
                response.status(200).json(restPage);
            }, (error) => {
                winston.error('Failed get place page: ' + error);
                response.status(500).json(error);
            }).catch((error) => {
                winston.error('Failed get place page: ' + error);
                response.status(500).json(error);
            });
    }

    deletePlace(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }

        this.placeService.deletePlace(id)
            .then((place) => {
                if (place) {
                    response.status(200).json(place);
                } else {
                    response.status(404).json();
                }
            }, (error) => {
                response.status(500).json(error);
            })
            .catch((error) => {
                response.status(500).json(error);
            });
    }
}