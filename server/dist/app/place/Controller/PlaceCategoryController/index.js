"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = require("../../../system/Controller");
const PlaceController_1 = require("../PlaceController");
class PlaceCategoryController {
    constructor(services) {
        this.userService = services.get('userService');
        this.placeCategoryService = services.get('placeCategoryService');
    }
    init(express) { }
    router(router) {
        router.get('/admin/place/categories', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.placeCategoriesPage(request, response); });
        router.post('/admin/place/category/save', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.savePlaceCategory(request, response); });
        router.get('/admin/place/category/list/:page', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getPlaceCategoryPage(request, response); });
        router.get('/admin/place/category/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getPlaceCategory(request, response); });
        router.delete('/admin/place/category/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.deletePlaceCategory(request, response); });
    }
    postInitialization() { }
    placeCategoriesPage(request, response) {
        response.render('place/template/categories', {
            menuKey: PlaceController_1.default.PLACES_PAGE_MENU_KEY,
            subMenuKey: PlaceCategoryController.CATEGORY_PLACE_SUB_MENU_KEY
        });
    }
    getPlaceCategory(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.placeCategoryService.getPlaceCategory(id)
            .then((placeCategory) => {
            if (placeCategory) {
                response.status(200).json(placeCategory);
            }
            else {
                response.status(404).json();
            }
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    getPlaceCategoryPage(request, response) {
        let page = parseInt(request.params.page);
        let perPage = parseInt(request.cookies['placeCategoryPerPage']) || Controller_1.DEFAULT_PER_PAGE;
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
    savePlaceCategory(request, response) {
        this.placeCategoryService.createModel(request)
            .then((placeCategoryModel) => {
            this.placeCategoryService.validate(placeCategoryModel, request)
                .then((placeCategoryModelValidation) => {
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
                }
                else {
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
    deletePlaceCategory(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.placeCategoryService.delete(id)
            .then((placeCategory) => {
            if (placeCategory) {
                response.status(200).json(placeCategory);
            }
            else {
                response.status(404).json();
            }
        }, (error) => {
            response.status(500).json();
        })
            .catch((error) => {
            response.status(500).json();
        });
    }
}
PlaceCategoryController.CATEGORY_PLACE_SUB_MENU_KEY = "admin_place_categories";
exports.default = PlaceCategoryController;
//# sourceMappingURL=index.js.map