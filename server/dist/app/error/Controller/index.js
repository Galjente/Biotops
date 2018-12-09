"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorController {
    init(express) { }
    router(router) {
        router.get('/404', (request, response) => { this.error404(request, response); });
        router.get('/500', (request, response) => { this.error500(request, response); });
    }
    postInitialization() { }
    error404(request, response) {
        response.status(404).json();
    }
    error500(request, response) {
        response.status(500).json();
    }
}
exports.default = ErrorController;
//# sourceMappingURL=index.js.map