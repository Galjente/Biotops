"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = require("../../../system/Controller");
const winston = require("winston");
class PlaceController {
    constructor(services) {
        this.userService = services.get('userService');
        this.placeService = services.get('placeService');
        this.storageService = services.get('storageService');
        this.placeCategoryService = services.get('placeCategoryService');
        this.placeExcelService = services.get('placeExcelService');
    }
    init(express) { }
    router(router) {
        router.get('/admin/places', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.placesPage(request, response); });
        router.post('/admin/place/save', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.savePlace(request, response); });
        router.post('/admin/place/excel/save', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, this.storageService.getImageRequestHandler('xlsxPlaces'), (request, response) => { this.saveExcelPlace(request, response); });
        router.get('/admin/place/list/:page', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getPlacePage(request, response); });
        router.get('/admin/place/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getPlace(request, response); });
        router.delete('/admin/place/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.deletePlace(request, response); });
    }
    postInitialization() { }
    placesPage(request, response) {
        this.placeCategoryService.getAll()
            .then((placeCategories) => {
            response.render('place/template/places', {
                menuKey: PlaceController.PLACES_PAGE_MENU_KEY,
                subMenuKey: PlaceController.PLACES_PAGE_MENU_KEY,
                placeCategories: placeCategories
            });
        }, (error) => {
            winston.error('Failed load places page: ' + error);
            response.redirect('/500');
        })
            .catch((error) => {
            winston.error('Failed load places page: ' + error);
            response.redirect('/500');
        });
    }
    saveExcelPlace(request, response) {
        this.placeExcelService.parseExcelFile(request.file.buffer)
            .then(() => {
            response.status(200).json({});
        }, (error) => {
            winston.error('Failed process Excel', error);
            response.status(500).json(error);
        })
            .catch((error) => {
            winston.error('Failed process Excel', error);
            response.status(500).json(error);
        });
    }
    savePlace(request, response) {
        this.placeService.createModel(request)
            .then((placeModel) => {
            this.placeService.validate(placeModel, request)
                .then((placeModelValidation) => {
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
                }
                else {
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
    getPlace(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.placeService.getPlace(id)
            .then((place) => {
            if (place) {
                response.status(200).json(place);
            }
            else {
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
    getPlacePage(request, response) {
        let page = parseInt(request.params.page);
        let perPage = parseInt(request.cookies['placePerPage']) || Controller_1.DEFAULT_PER_PAGE;
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
    deletePlace(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.placeService.deletePlace(id)
            .then((place) => {
            if (place) {
                response.status(200).json(place);
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
}
PlaceController.PLACES_PAGE_MENU_KEY = "admin_places";
exports.default = PlaceController;
//# sourceMappingURL=index.js.map