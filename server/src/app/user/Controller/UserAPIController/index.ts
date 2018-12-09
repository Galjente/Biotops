"use strict";
import * as passport from "passport";
import * as jwtSimple from 'jwt-simple';
import {Application, Router, Request, Response, NextFunction} from "express";
import {Controller} from "../../../system/Controller";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import User from "../../Domain/Entity/User/index";
import UserService, {UserModel} from "../../Service/UserService/index";
import * as winston from "winston";
import {GraphAPI} from 'facebook-graph';

export default class UserAPIController implements Controller {

    private userService:UserService;

    constructor(services: Map<string, any>) {
        this.userService = services.get('userService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.post('/api/login', (request: Request & RequestWithLocale, response: Response) => {this.processLoginApi(request, response)});
        router.post('/api/registration', (request: Request & RequestWithLocale, response: Response) => {this.processRegistrationApi(request, response)});

        router.get('/api/user/facebook/login',
            passport.authenticate('facebook', {session: false,}));
        router.get('/api/user/facebook/callback',
            passport.authenticate('facebook', { session: false, failureRedirect: '/api/user/facebook/login' }),
            (request: Request & RequestWithLocale, response: Response) => {this.processFacebookLogin(request, response)});

        router.get('/api/user/current/profile',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.processCurrentUserProfile(request, response)});
        router.get('/api/user/:id/profile',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.processUserProfile(request, response)});
        router.get('/api/user/current/top/position',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getCurrentUserTopPosition(request, response)});
        router.get('/api/user/:id/top/position',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getUserTopPosition(request, response)});
        router.get('/api/user/friends',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getUserFriends(request, response)});

    }

    postInitialization(): void {}

    processLoginApi(request: Request & RequestWithLocale, response: Response):void {
        let email:string = request.body.email;
        let password:string = request.body.password;
        let fbAccessToken:string = request.body.accessToken;
        if (fbAccessToken && fbAccessToken.length) {
            let graph = new GraphAPI(fbAccessToken);
            graph.getObject('me', {'fields': 'id,name,picture.type(large),email,first_name,last_name'}, (error, userData) => {
                if (error) {
                    winston.error('Failed logged in with facebook', error);
                    response.status(401).json(error);
                    return;
                }

                let pictureLink:string = userData.picture && userData.picture.data ? userData.picture.data.url : null;
                this.userService.getOrCreateByFacebook(userData.id, userData.first_name, userData.last_name, pictureLink)
                    .then(
                        (user) => {
                            this.userService.retrieveFacebookFriends(user, fbAccessToken)
                                .then(
                                    (users) => {
                                        let token: string = jwtSimple.encode({id: user.id}, "biotops");
                                        this.userService.loginRegistration(request, user, 'facebook');
                                        response.status(200).json({token: token});
                                    },
                                    (error) => {
                                        winston.error('Failed save facebook data', error);
                                        response.status(401).json(error);
                                    }
                                )
                                .catch((error) => {
                                    winston.error('Failed save facebook data', error);
                                    response.status(401).json(error);
                                });
                        },
                        (error) => {
                            winston.error('Failed save facebook data', error);
                            response.status(401).json(error);
                        }
                    ).catch((error) => {
                        winston.error('Failed save facebook data', error);
                        response.status(401).json(error);
                    });
            });

        } else {
            if (!email || !password || !email.length || !password.length) {
                response.status(401).json();
                return;
            }

            this.userService.getUserByUsernameAndPassword(email, password).then(
                (user) => {
                    if (user) {
                        let token: string = jwtSimple.encode({id: user.id}, "biotops");
                        this.userService.loginRegistration(request, user, 'api');
                        response.status(200).json({token: token});
                    } else {
                        response.status(401).json();
                    }
                },
                (error) => {
                    response.status(401).json(error);
                }
            )
                .catch((error) => {
                    response.status(500).json(error);
                });
        }
    }

    processFacebookLogin(request: Request & RequestWithLocale, response: Response):void {
        let user: User = request.user;
        let token:string = jwtSimple.encode({id: user.id}, "biotops");
        let link: string = `OAuthLogin://login?token=${token}`;
        response.redirect(link);
    }

    processRegistrationApi(request: Request & RequestWithLocale, response: Response):void {
        let email = request.body.email;
        let password = request.body.password;
        let rePassword = request.body.password;

        this.userService.getByLogin(email)
            .then(
                (user) => {
                    if (user || password !== rePassword) {
                        response.status(400).json();
                    } else {
                        this.userService.save({
                            email: email,
                            password: password,
                            rePassword: rePassword,
                            enabled: true,
                            admin: false
                        }).then(
                            (user) => {
                                let token:string = jwtSimple.encode({id: user.id}, "biotops");
                                response.status(200).json({
                                    user: user,
                                    token: token
                                });
                            },
                            (error) => {
                                response.status(500).json();
                            }
                        )
                            .catch(
                                (error) => {
                                    response.status(500).json();
                                }
                            );
                    }
                },
                (error) => {
                    response.status(500).json();
                }
            )
            .catch((error) => {
                response.status(500).json();
            });
    }

    processCurrentUserProfile(request: Request & RequestWithLocale, response: Response):void {
        let currentUser: UserModel = request.user;
        if (currentUser) {
            this.userService.getById(currentUser.id)
                .then(
                    (user) => {
                        response.status(200).json({
                            name: user.name,
                            surname: user.surname,
                            imageUrl: user.profilePhotoLink
                        });
                    },
                    (error) => {
                        winston.error('Failed fetch current user', error);
                        response.status(500).json();
                    }
                )
                .catch((error) => {
                    winston.error('Failed fetch current user', error);
                    response.status(500).json();
                });
        } else {
            response.status(404).json();
        }
    }

    processUserProfile(request: Request & RequestWithLocale, response: Response):void {
        let userId = request.params.id

        if (!userId || isNaN(userId)) {
            response.status(404).json();
            return;
        }
        this.userService.getById(userId)
            .then(
                (user) => {
                    response.status(200).json({
                        name: user.name,
                        surname: user.surname,
                        imageUrl: user.profilePhotoLink
                    });
                },
                (error) => {
                    winston.error('Failed fetch current user', error);
                    response.status(500).json();
                }
            )
            .catch((error) => {
                winston.error('Failed fetch current user', error);
                response.status(500).json();
            });
    }

    getCurrentUserTopPosition(request: Request & RequestWithLocale, response: Response): void {
        let user:User = request.user;
        if (!user) {
            response.status(401).json();
            return;
        }
        this.userService.getUserPlaceInTop(user.id)
            .then(
                (position) => {
                    if (isNaN(position)) {
                        response.status(404).json();
                    } else {
                        response.status(200).json({position: position});
                    }
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getUserTopPosition(request: Request & RequestWithLocale, response: Response): void {
        let userId: number = parseInt(request.params.id);
        if (!userId || isNaN(userId)) {
            response.status(404).json();
            return;
        }
        this.userService.getUserPlaceInTop(userId)
            .then(
                (position) => {
                    if (isNaN(position)) {
                        response.status(404).json();
                    } else {
                        response.status(200).json({position: position});
                    }
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getUserFriends(request: Request & RequestWithLocale, response: Response):void {
        let token = request.query.token;
        let currentUser: UserModel = request.user;
        this.userService.getById(currentUser.id)
            .then(
                (user) => {
                    let lastFriendsUpdate = user.friendsUpdateDate ? new Date().getTime() - user.friendsUpdateDate.getTime() : new Date().getTime();
                    winston.debug(`Last friends fetch from facebook for user(${user.id}) - ${lastFriendsUpdate} ms`);
                    if (token && lastFriendsUpdate > (5 * 60 * 1000)) {
                        this.userService.retrieveFacebookFriends(user, token)
                            .then(
                                (users) => {
                                    response.status(200).json(users);
                                },
                                (error) => {
                                    winston.error('Failed fetch current user friends', error);
                                    response.status(500).json();
                                }
                            ).catch((error) => {
                                winston.error('Failed fetch current user friends', error);
                                response.status(500).json();
                            });
                    } else {
                        winston.debug('Return cached friends');
                        response.status(200).json(user.friends);
                    }
                },
                (error) => {
                    winston.error('Failed fetch current user', error);
                    response.status(500).json();
                }
            )
            .catch((error) => {
                winston.error('Failed fetch current user', error);
                response.status(500).json();
            });
    }
}