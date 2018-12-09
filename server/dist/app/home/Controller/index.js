"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HomeController {
    init(express) { }
    router(router) {
        router.get('/', (request, response) => { this.mainPage(request, response); });
        router.get('/index', (request, response) => { this.mainPage(request, response); });
        router.get('/index.html', (request, response) => { this.mainPage(request, response); });
        router.get('/privacy-policy', (request, response) => { this.privacyPolicyPage(request, response); });
        router.get('/privacy-policy.html', (request, response) => { this.privacyPolicyPage(request, response); });
        router.get('/terms-and-conditions', (request, response) => { this.termsAndConditionsPage(request, response); });
        router.get('/terms-and-conditions.html', (request, response) => { this.termsAndConditionsPage(request, response); });
    }
    postInitialization() { }
    mainPage(request, response) {
        response.render('home/template/home', {
            layout: 'system/template/external-layout'
        });
    }
    privacyPolicyPage(request, response) {
        response.render('home/template/privacyPolicy', {
            layout: 'system/template/external-layout'
        });
    }
    termsAndConditionsPage(request, response) {
        response.render('home/template/termsAndConditions', {
            layout: 'system/template/external-layout'
        });
    }
}
exports.default = HomeController;
//# sourceMappingURL=index.js.map