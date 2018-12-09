"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminHomeController {
    constructor(services) {
        this.userService = services.get('userService');
    }
    init(express) { }
    router(router) {
        router.get('/admin', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.adminHomePage(request, response); });
    }
    postInitialization() { }
    adminHomePage(request, response) {
        response.render('adminhome/template/home', {
            menuKey: AdminHomeController.ADMIN_HOME_PAGE_MENU_KEY
        });
    }
}
AdminHomeController.ADMIN_HOME_PAGE_MENU_KEY = "admin_home";
exports.default = AdminHomeController;
//# sourceMappingURL=index.js.map