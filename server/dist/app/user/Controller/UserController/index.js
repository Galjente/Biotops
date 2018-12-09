"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt");
const FacebookStrategy = require("passport-facebook");
const nconf = require("nconf");
const RememberMeStrategy_1 = require("../../passport/RememberMeStrategy");
const winston = require("winston");
const Controller_1 = require("../../../system/Controller");
const loginSettings = {
    failureRedirect: '/admin/login?error',
};
class UserController {
    constructor(services) {
        this.userService = services.get('userService');
    }
    init(express) {
        let jwtStrategy = new JwtStrategy.Strategy({
            jwtFromRequest: JwtStrategy.ExtractJwt.fromAuthHeaderWithScheme('bearer'),
            secretOrKey: 'biotops'
        }, (payload, done) => {
            this.userService.getById(payload.id).then((user) => {
                let userModel = this.userService.transformToUserPassportModel(user);
                done(null, userModel);
            }, (err) => {
                done(err);
            }).catch((error) => {
                done(error);
            });
        });
        let localStrategy = new LocalStrategy.Strategy({
            usernameField: 'email',
            passwordField: 'password'
        }, (username, password, done) => {
            this.userService.getUserByUsernameAndPassword(username, password)
                .then((user) => {
                let userModel = this.userService.transformToUserPassportModel(user);
                done(null, userModel);
            }, (error) => { done(error); })
                .catch((error) => { done(error); });
        });
        let rememberMeStrategy = new RememberMeStrategy_1.default((token, done) => {
            this.userService.getByToken(token)
                .then((user) => {
                let userModel = this.userService.transformToUserPassportModel(user);
                done(null, userModel);
            }, (error) => {
                done(error);
            }).catch((error) => {
                done(error);
            });
        }, { key: UserController.COOKIE_REMEMBER_ME_KEY });
        let facebookStrategy = new FacebookStrategy.Strategy({
            clientID: '226835481180939',
            clientSecret: 'c00d7591f1d65e2996c189c9af81d7fc',
            callbackURL: nconf.get('biotops_address') || 'http://10.50.55.12:3000/api/user/facebook/callback',
            profileFields: ['id', 'name', 'displayName', 'picture.type(large)', 'email']
        }, (accessToken, refreshToken, profile, done) => {
            let profileIMageUri = profile.photos && profile.photos.length ? profile.photos[0].value : null;
            this.userService.getOrCreateByFacebook(profile.id, profile.name.givenName, profile.name.familyName, profileIMageUri).then((user) => {
                this.userService.retrieveFacebookFriends(user, accessToken)
                    .then((users) => {
                    let userModel = this.userService.transformToUserPassportModel(user);
                    done(null, userModel);
                }, (error) => {
                    done(error);
                })
                    .catch((error) => {
                    done(error);
                });
            }, (error) => {
                done(error);
            }).catch((error) => {
                done(error);
            });
        });
        passport.serializeUser((user, done) => {
            done(null, user && user.id ? user.id : null);
        });
        passport.deserializeUser((id, done) => {
            this.userService.getById(id).then((user) => {
                let userModel = this.userService.transformToUserPassportModel(user);
                done(null, userModel);
            }, (err) => {
                done(err);
            }).catch((error) => {
                done(error);
            });
        });
        passport.use(localStrategy);
        passport.use(rememberMeStrategy);
        passport.use(jwtStrategy);
        passport.use(facebookStrategy);
        express.use(passport.initialize());
        express.use(passport.session());
        express.use(passport.authenticate(['jwt', rememberMeStrategy.name]));
    }
    router(router) {
        router.get('/admin/login', (request, response) => { this.loginPage(request, response); });
        router.post('/admin/login', passport.authenticate('local', loginSettings), (request, response, next) => { this.processRememberMe(request, response, next); }, (request, response) => { this.processLogin(request, response); });
        router.get('/admin/logout', (request, response) => { this.processLogout(request, response); });
        router.get('/admin/users', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.usersPage(request, response); });
        router.post('/admin/user/save', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.saveUser(request, response); });
        router.get('/admin/user/list/:page', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getUserPage(request, response); });
        router.get('/admin/user/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getUser(request, response); });
        router.delete('/admin/user/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.deleteUser(request, response); });
    }
    postInitialization() {
        // FIXME remove later
        this.userService.getByLogin('supervisor@alpinweiss.eu')
            .then((user) => {
            if (!user) {
                this.userService.save({
                    email: 'supervisor@alpinweiss.eu',
                    password: 'supervisor',
                    rePassword: 'supervisor',
                    enabled: true,
                    admin: true
                }).then((user) => { winston.debug('default user created'); }, (error) => { winston.error('Failed create default user', error); });
            }
        }, (error) => {
            winston.debug('Failed retrieve user', error);
        });
    }
    loginPage(request, response) {
        if (request.isAuthenticated()) {
            response.redirect('/admin');
        }
        else {
            response.render('user/template/login', {
                layout: 'system/template/login-layout'
            });
        }
    }
    processRememberMe(request, response, next) {
        if (!request.body.remember_me) {
            next();
            return;
        }
        this.userService.generateAndSaveToken(request.user.id)
            .then((user) => {
            request.user = user;
            response.cookie(UserController.COOKIE_REMEMBER_ME_KEY, user.token, { path: '/', httpOnly: true, maxAge: 604800000 });
            next();
        }, (error) => {
            next(error);
        })
            .catch((error) => {
            next(error);
        });
    }
    processLogin(request, response) {
        if (request.isAuthenticated()) {
            this.userService.getById(request.user.id).then((user) => {
                this.userService.loginRegistration(request, user, 'web');
            }, (error) => {
                winston.error('Failed get user after login', error);
            }).catch((error) => {
                winston.error('Failed get user after login', error);
            });
            response.redirect('/admin');
        }
        else {
            response.redirect('/admin/login');
        }
    }
    processLogout(request, response) {
        if (!request.user || isNaN(request.user.id)) {
            response.redirect('/500');
            return;
        }
        this.userService.deleteToken(request.user.id)
            .then((user) => {
            response.clearCookie(UserController.COOKIE_REMEMBER_ME_KEY);
            request.logout();
            response.redirect('/');
        }, (error) => {
            response.redirect('/500');
        })
            .catch((error) => {
            response.redirect('/500');
        });
    }
    usersPage(request, response) {
        response.render('user/template/users', {
            menuKey: UserController.USERS_PAGE_MENU_KEY
        });
    }
    saveUser(request, response) {
        this.userService.createModel(request).then((userModel) => {
            this.userService.validate(userModel, request).then((userModelValidation) => {
                if (userModelValidation.valid) {
                    this.userService.save(userModel).then((user) => {
                        response.status(200).json(user);
                    }, (error) => {
                        winston.error(error);
                        response.status(500).json(error);
                    })
                        .catch((error) => {
                        winston.error(error);
                        response.status(500).json(error);
                    });
                }
                else {
                    response.status(400).json(userModelValidation);
                }
            })
                .catch((error) => {
                winston.error(error);
                response.status(500).json(error);
            });
        }, (error) => {
            winston.error(error);
            response.status(500).json(error);
        })
            .catch((error) => {
            winston.error(error);
            response.status(500).json(error);
        });
    }
    getUserPage(request, response) {
        let page = parseInt(request.params.page);
        let perPage = parseInt(request.cookies['userPerPage']) || Controller_1.DEFAULT_PER_PAGE;
        if (isNaN(page)) {
            response.status(400).json();
            return;
        }
        if (perPage != request.cookies.userPerPage) {
            response.cookie('userPerPage', perPage);
        }
        this.userService.getPage(page, perPage).then((restPage) => {
            response.status(200).json(restPage);
        }, (error) => {
            response.status(500).json(error);
        }).catch((error) => {
            winston.error('Failed get place page: ' + error);
            response.status(500).json(error);
        });
    }
    getUser(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.userService.getById(id).then((user) => {
            if (user) {
                response.status(200).json(user);
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
    deleteUser(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.userService.deleteUser(id).then((user) => {
            if (user) {
                response.status(200).json(user);
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
UserController.USERS_PAGE_MENU_KEY = "admin_users";
UserController.COOKIE_REMEMBER_ME_KEY = "biotops_key";
exports.default = UserController;
//# sourceMappingURL=index.js.map