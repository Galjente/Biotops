"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = require("../../system/Controller");
class StorageController {
    constructor(services) {
        this.storageService = services.get('storageService');
        this.userService = services.get('userService');
    }
    init(express) { }
    router(router) {
        router.get('/admin/storage', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.storagePage(request, response); });
        router.get('/storage/image/:hash', (request, response) => { this.getImageContentByHash(request, response); });
        router.get('/admin/storage/image/list/:page', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getImagePage(request, response); });
        router.post('/admin/storage/image/save', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, this.storageService.getImageRequestHandler('image'), (request, response) => { this.saveImage(request, response); });
        router.delete('/admin/storage/image/:id', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.deleteImage(request, response); });
        router.get('/admin/storage/image/:id', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getImage(request, response); });
    }
    postInitialization() { }
    storagePage(request, response) {
        response.render('storage/template/image', {
            menuKey: StorageController.STORAGE_PAGE_MENU_KEY
        });
    }
    saveImage(request, response) {
        this.storageService.createModel(request)
            .then((imageModel) => {
            this.storageService.validate(imageModel, request)
                .then((imageValidationModel) => {
                this.storageService.saveImage(imageModel)
                    .then((image) => {
                    response.status(200).json(image);
                }, (error) => {
                    response.status(500).json(error);
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
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    getImagePage(request, response) {
        let page = parseInt(request.params.page);
        let perPage = parseInt(request.cookies['imagePerPage']) || Controller_1.DEFAULT_PER_PAGE;
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
    deleteImage(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }
        this.storageService.deleteImage(id)
            .then((image) => {
            if (image) {
                response.status(200).json(image);
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
    getImage(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }
        this.storageService.getImage(id)
            .then((image) => {
            if (image) {
                response.status(200).json(image);
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
    getImageContentByHash(request, response) {
        let hash = request.params.hash;
        if (!hash) {
            response.status(400).json();
            return;
        }
        this.storageService.getImageContentByHash(hash)
            .then((imageResponseModel) => {
            if (imageResponseModel) {
                response.writeHead(200, { 'Content-Type': imageResponseModel.contentType });
                response.end(imageResponseModel.content, 'binary');
            }
            else {
                response.status(404).json();
            }
        }, (error) => {
            response.status(500).json(error);
        }).catch((error) => {
            response.status(500).json(error);
        });
    }
}
StorageController.STORAGE_PAGE_MENU_KEY = "admin_storage";
exports.default = StorageController;
//# sourceMappingURL=index.js.map