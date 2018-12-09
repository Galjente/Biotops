"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlaceCategoryAPIController {
    constructor(services) {
        this.userService = services.get('userService');
        this.placeCategoryService = services.get('placeCategoryService');
    }
    init(express) { }
    router(router) {
        router.get('/api/place/category/all', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getAllPlaceCategories(request, response); });
    }
    postInitialization() { }
    getAllPlaceCategories(request, response) {
        this.placeCategoryService.getAllPublished()
            .then((placeCategories) => {
            let apiCategories = placeCategories
                .filter((category) => {
                return category.icon != null;
            }).map((category) => {
                return {
                    id: category.id,
                    name: category.name,
                    uri: category.icon.uri,
                };
            });
            response.status(200).json(apiCategories);
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
}
exports.default = PlaceCategoryAPIController;
//# sourceMappingURL=index.js.map