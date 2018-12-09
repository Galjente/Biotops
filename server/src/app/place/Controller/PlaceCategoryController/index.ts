"use strict";
import {Application, Router, Request, Response, NextFunction} from "express";
import {Controller, DEFAULT_PER_PAGE} from "../../../system/Controller";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import PlaceCategoryService from "../../Service/PlaceCategoryService";
import UserService from "../../../user/Service/UserService";
import PlaceController from "../PlaceController";

export default class PlaceCategoryController implements Controller {

    private static CATEGORY_PLACE_SUB_MENU_KEY:string = "admin_place_categories";

    private placeCategoryService:PlaceCategoryService;
    private userService: UserService;

    constructor(services: Map<string, any>) {
        this.userService = services.get('userService');
        this.placeCategoryService = services.get('placeCategoryService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/admin/place/categories',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.placeCategoriesPage(request, response)});

        router.post('/admin/place/category/save',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.savePlaceCategory(request, response)});
        router.get('/admin/place/category/list/:page',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getPlaceCategoryPage(request, response)});
        router.get('/admin/place/category/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getPlaceCategory(request, response)});
        router.delete('/admin/place/category/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.deletePlaceCategory(request, response)});
    }

    postInitialization(): void {}

    placeCategoriesPage(request: Request & RequestWithLocale, response: Response):void {
        response.render('place/template/categories', {
            menuKey: PlaceController.PLACES_PAGE_MENU_KEY,
            subMenuKey: PlaceCategoryController.CATEGORY_PLACE_SUB_MENU_KEY
        });
    }

    getPlaceCategory(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }

        this.placeCategoryService.getPlaceCategory(id)
            .then((placeCategory) => {
                if (placeCategory) {
                    response.status(200).json(placeCategory);
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

    getPlaceCategoryPage(request: Request & RequestWithLocale, response: Response):void {
        let page: number = parseInt(request.params.page);
        let perPage: number = parseInt(request.cookies['placeCategoryPerPage']) || DEFAULT_PER_PAGE;
        if (isNaN(page)) {
            response.status(400).json();
            return;
        }

        if (perPage != request.cookies.placeCategoryPerPage) {
            response.cookie('placeCategoryPerPage', perPage);
        }

        this.placeCategoryService.getPage(page, perPage)
            .then((restPage) => {
                response.status(200).json(restPage);
            }, (error) => {
                response.status(500).json(error);
            }).catch((error) => {
            response.status(500).json(error);
        });
    }

    savePlaceCategory(request: Request & RequestWithLocale, response: Response):void {
        this.placeCategoryService.createModel(request)
            .then((placeCategoryModel) => {
                this.placeCategoryService.validate(placeCategoryModel, request)
                    .then((placeCategoryModelValidation)=> {
                        if (placeCategoryModelValidation.valid) {
                            this.placeCategoryService.save(placeCategoryModel)
                                .then((badge) => {
                                    response.status(200).json(badge);
                                }, (error) => {
                                    response.status(500).json(error);
                                })
                                .catch((error) => {
                                    response.status(500).json(error);
                                });
                        } else {
                            response.status(400).json(placeCategoryModelValidation);
                        }
                    })
                    .catch((error) => {
                        response.status(500).json(error);
                    });
            }, (error) => {
                response.status(500).json(error);
            })
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    deletePlaceCategory(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.placeCategoryService.delete(id)
            .then(
                (placeCategory) => {
                    if (placeCategory) {
                        response.status(200).json(placeCategory);
                    } else {
                        response.status(404).json();
                    }
                },
                (error) => {
                    response.status(500).json();
                }
            )
            .catch((error) => {
                response.status(500).json();
            });
    }
}