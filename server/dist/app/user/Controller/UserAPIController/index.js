"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const jwtSimple = require("jwt-simple");
const winston = require("winston");
const facebook_graph_1 = require("facebook-graph");
class UserAPIController {
    constructor(services) {
        this.userService = services.get('userService');
    }
    init(express) { }
    router(router) {
        router.post('/api/login', (request, response) => { this.processLoginApi(request, response); });
        router.post('/api/registration', (request, response) => { this.processRegistrationApi(request, response); });
        router.get('/api/user/facebook/login', passport.authenticate('facebook', { session: false, }));
        router.get('/api/user/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/api/user/facebook/login' }), (request, response) => { this.processFacebookLogin(request, response); });
        router.get('/api/user/current/profile', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.processCurrentUserProfile(request, response); });
        router.get('/api/user/:id/profile', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.processUserProfile(request, response); });
        router.get('/api/user/current/top/position', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getCurrentUserTopPosition(request, response); });
        router.get('/api/user/:id/top/position', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getUserTopPosition(request, response); });
        router.get('/api/user/friends', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getUserFriends(request, response); });
    }
    postInitialization() { }
    processLoginApi(request, response) {
        let email = request.body.email;
        let password = request.body.password;
        let fbAccessToken = request.body.accessToken;
        if (fbAccessToken && fbAccessToken.length) {
            let graph = new facebook_graph_1.GraphAPI(fbAccessToken);
            graph.getObject('me', { 'fields': 'id,name,picture.type(large),email,first_name,last_name' }, (error, userData) => {
                if (error) {
                    winston.error('Failed logged in with facebook', error);
                    response.status(401).json(error);
                    return;
                }
                let pictureLink = userData.picture && userData.picture.data ? userData.picture.data.url : null;
                this.userService.getOrCreateByFacebook(userData.id, userData.first_name, userData.last_name, pictureLink)
                    .then((user) => {
                    this.userService.retrieveFacebookFriends(user, fbAccessToken)
                        .then((users) => {
                        let token = jwtSimple.encode({ id: user.id }, "biotops");
                        this.userService.loginRegistration(request, user, 'facebook');
                        response.status(200).json({ token: token });
                    }, (error) => {
                        winston.error('Failed save facebook data', error);
                        response.status(401).json(error);
                    })
                        .catch((error) => {
                        winston.error('Failed save facebook data', error);
                        response.status(401).json(error);
                    });
                }, (error) => {
                    winston.error('Failed save facebook data', error);
                    response.status(401).json(error);
                }).catch((error) => {
                    winston.error('Failed save facebook data', error);
                    response.status(401).json(error);
                });
            });
        }
        else {
            if (!email || !password || !email.length || !password.length) {
                response.status(401).json();
                return;
            }
            this.userService.getUserByUsernameAndPassword(email, password).then((user) => {
                if (user) {
                    let token = jwtSimple.encode({ id: user.id }, "biotops");
                    this.userService.loginRegistration(request, user, 'api');
                    response.status(200).json({ token: token });
                }
                else {
                    response.status(401).json();
                }
            }, (error) => {
                response.status(401).json(error);
            })
                .catch((error) => {
                response.status(500).json(error);
            });
        }
    }
    processFacebookLogin(request, response) {
        let user = request.user;
        let token = jwtSimple.encode({ id: user.id }, "biotops");
        let link = `OAuthLogin://login?token=${token}`;
        response.redirect(link);
    }
    processRegistrationApi(request, response) {
        let email = request.body.email;
        let password = request.body.password;
        let rePassword = request.body.password;
        this.userService.getByLogin(email)
            .then((user) => {
            if (user || password !== rePassword) {
                response.status(400).json();
            }
            else {
                this.userService.save({
                    email: email,
                    password: password,
                    rePassword: rePassword,
                    enabled: true,
                    admin: false
                }).then((user) => {
                    let token = jwtSimple.encode({ id: user.id }, "biotops");
                    response.status(200).json({
                        user: user,
                        token: token
                    });
                }, (error) => {
                    response.status(500).json();
                })
                    .catch((error) => {
                    response.status(500).json();
                });
            }
        }, (error) => {
            response.status(500).json();
        })
            .catch((error) => {
            response.status(500).json();
        });
    }
    processCurrentUserProfile(request, response) {
        let currentUser = request.user;
        if (currentUser) {
            this.userService.getById(currentUser.id)
                .then((user) => {
                response.status(200).json({
                    name: user.name,
                    surname: user.surname,
                    imageUrl: user.profilePhotoLink
                });
            }, (error) => {
                winston.error('Failed fetch current user', error);
                response.status(500).json();
            })
                .catch((error) => {
                winston.error('Failed fetch current user', error);
                response.status(500).json();
            });
        }
        else {
            response.status(404).json();
        }
    }
    processUserProfile(request, response) {
        let userId = request.params.id;
        if (!userId || isNaN(userId)) {
            response.status(404).json();
            return;
        }
        this.userService.getById(userId)
            .then((user) => {
            response.status(200).json({
                name: user.name,
                surname: user.surname,
                imageUrl: user.profilePhotoLink
            });
        }, (error) => {
            winston.error('Failed fetch current user', error);
            response.status(500).json();
        })
            .catch((error) => {
            winston.error('Failed fetch current user', error);
            response.status(500).json();
        });
    }
    getCurrentUserTopPosition(request, response) {
        let user = request.user;
        if (!user) {
            response.status(401).json();
            return;
        }
        this.userService.getUserPlaceInTop(user.id)
            .then((position) => {
            if (isNaN(position)) {
                response.status(404).json();
            }
            else {
                response.status(200).json({ position: position });
            }
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    getUserTopPosition(request, response) {
        let userId = parseInt(request.params.id);
        if (!userId || isNaN(userId)) {
            response.status(404).json();
            return;
        }
        this.userService.getUserPlaceInTop(userId)
            .then((position) => {
            if (isNaN(position)) {
                response.status(404).json();
            }
            else {
                response.status(200).json({ position: position });
            }
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    getUserFriends(request, response) {
        let token = request.query.token;
        let currentUser = request.user;
        this.userService.getById(currentUser.id)
            .then((user) => {
            let lastFriendsUpdate = user.friendsUpdateDate ? new Date().getTime() - user.friendsUpdateDate.getTime() : new Date().getTime();
            winston.debug(`Last friends fetch from facebook for user(${user.id}) - ${lastFriendsUpdate} ms`);
            if (token && lastFriendsUpdate > (5 * 60 * 1000)) {
                this.userService.retrieveFacebookFriends(user, token)
                    .then((users) => {
                    response.status(200).json(users);
                }, (error) => {
                    winston.error('Failed fetch current user friends', error);
                    response.status(500).json();
                }).catch((error) => {
                    winston.error('Failed fetch current user friends', error);
                    response.status(500).json();
                });
            }
            else {
                winston.debug('Return cached friends');
                response.status(200).json(user.friends);
            }
        }, (error) => {
            winston.error('Failed fetch current user', error);
            response.status(500).json();
        })
            .catch((error) => {
            winston.error('Failed fetch current user', error);
            response.status(500).json();
        });
    }
}
exports.default = UserAPIController;
//# sourceMappingURL=index.js.map