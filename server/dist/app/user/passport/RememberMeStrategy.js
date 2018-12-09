"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RememberMeStrategy {
    constructor(verifyFunction, cookieOptions) {
        this.name = 'remember_me';
        this.cookieKey = 'remember_me';
        if (!verifyFunction) {
            throw new Error('remember me cookie authentication strategy requires a verify function');
        }
        this.verifyFunction = verifyFunction;
        if (cookieOptions && cookieOptions.key) {
            this.cookieKey = cookieOptions.key;
        }
    }
    authenticate(request, options) {
        if (request.isAuthenticated()) {
            this.pass();
            return;
        }
        let token = request.cookies[this.cookieKey];
        if (!token) {
            this.pass();
            return;
        }
        this.verifyFunction(token, (error, user) => {
            if (error) {
                this.error(error);
            }
            else if (!user) {
                this.pass();
            }
            else {
                this.success(user, null);
            }
        });
    }
    fail(challenge, status) { }
    success(user, info) { }
    redirect(url, status) { }
    pass() { }
    error(err) { }
}
exports.default = RememberMeStrategy;
//# sourceMappingURL=RememberMeStrategy.js.map