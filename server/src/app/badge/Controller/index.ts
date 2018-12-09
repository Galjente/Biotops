"use strict";
import {Controller, DEFAULT_PER_PAGE} from "../../system/Controller";
import {Application, Router, Request, Response, NextFunction} from "express";
import {RequestWithLocale} from "../../system/RequestWithLocale";
import BadgeService, {ApiBadgeModel} from '../Service/BadgeService';
import UserService from "../../user/Service/UserService/index";
import User from "../../user/Domain/Entity/User/index";
import Image from "../../storage/Domain/Entity/Image/index";
import * as winston from "winston";

export default class BadgeController implements Controller {

    private static BADGES_PAGE_MENU_KEY:string = "admin_badges";

    private badgeService: BadgeService;
    private userService: UserService;

    constructor(services: Map<string, any>) {
        this.badgeService = services.get('badgeService');
        this.userService = services.get('userService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/admin/badges',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.badgesPage(request, response)});
        router.post('/admin/badge/save',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.saveBadge(request, response)});
        router.get('/admin/badge/list/:page',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getBadgePage(request, response)});
        router.get('/admin/badge/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getBadge(request, response)});
        router.delete('/admin/badge/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationAdminMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.deleteBadge(request, response)});

        router.get('/api/badge/user/current',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getCurrentUserBadges(request, response)});
        router.get('/api/badge/user/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getUserBadges(request, response)});
    }

    postInitialization(): void {}

    badgesPage(request: Request & RequestWithLocale, response: Response):void {
        response.render('badge/template/badges', {
            menuKey: BadgeController.BADGES_PAGE_MENU_KEY
        });
    }

    getBadge(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }

        this.badgeService.getBadge(id)
            .then((badge) => {
                if (badge && !badge.deleted) {
                    response.status(200).json(badge);
                } else {
                    response.status(404).json();
                }
            }, (error) => {
                response.status(500).json(error);
            })
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getBadgePage(request: Request & RequestWithLocale, response: Response):void {
        let page: number = parseInt(request.params.page);
        let perPage: number = parseInt(request.cookies['badgePerPage']) || DEFAULT_PER_PAGE;
        if (isNaN(page)) {
            response.status(400).json();
            return;
        }

        if (perPage != request.cookies.badgePerPage) {
            response.cookie('badgePerPage', perPage);
        }

        this.badgeService.getPage(page, perPage)
            .then((restPage) => {
                response.status(200).json(restPage);
            }, (error) => {
                response.status(500).json(error);
            }).catch((error) => {
                response.status(500).json(error);
            });
    }

    saveBadge(request: Request & RequestWithLocale, response: Response):void {
        this.badgeService.createModel(request)
            .then((badgeModel) => {
                this.badgeService.validate(badgeModel, request)
                    .then((badgeModelValidation)=> {
                        if (badgeModelValidation.valid) {
                            this.badgeService.save(badgeModel)
                                .then((badge) => {
                                    response.status(200).json(badge);
                                }, (error) => {
                                    response.status(500).json(error);
                                })
                                .catch((error) => {
                                    response.status(500).json(error);
                                });
                        } else {
                            response.status(400).json(badgeModelValidation);
                        }
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

    deleteBadge(request: Request & RequestWithLocale, response: Response):void {
        let id:number = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }

        this.badgeService.deleteBadge(id)
            .then(
                (badge) => {
                    if (badge) {
                        response.status(200).json(badge);
                    } else {
                        response.status(404).json();
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

    getCurrentUserBadges(request: Request & RequestWithLocale, response: Response):void {
        let user: User = request.user;
        if (!user) {
            response.status(401).json();
            return;
        }
        this.badgeService.getAllBadgesWithAchievementStatusForUser(user.id)
            .then(
                (badges) => {
                    let achievedCount: number = 0;
                    let models: Array<ApiBadgeModel> = badges
                        .filter((badge) => {
                            return badge.imageActivate && badge.imageDeactivate;
                        })
                        .map((badge) => {
                            let badgeApiModel: ApiBadgeModel = {
                                name: badge.name,
                                achieved: badge.achieved,
                                description: badge.achieved ? badge.congratulationText : badge.aimText,
                            };

                            if (badge.achieved && badge.imageActivate) {
                                let image: Image = <Image>badge.imageActivate;
                                badgeApiModel.imageUrl = image.uri;
                            } else if (!badge.achieved && badge.imageDeactivate) {
                                let image: Image = <Image>badge.imageDeactivate;
                                badgeApiModel.imageUrl = image.uri;
                            }

                            achievedCount += badge.achieved ? 1 : 0;

                            return badgeApiModel;
                        });
                    response.status(200).json({
                        badges: models,
                        achievedCount: achievedCount
                    });
                },
                (error) => {
                    winston.error(error);
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                winston.error(error);
                response.status(500).json(error);
            });
    }

    getUserBadges(request: Request & RequestWithLocale, response: Response):void {
        let userId = request.params.id;
        if (!userId || isNaN(userId)) {
            response.status(400).json();
            return;
        }

        this.userService.getById(userId)
            .then(
                (user) => {
                    if (!user) {
                        response.status(401).json();
                        return;
                    }
                    this.badgeService.getAllBadgesWithAchievementStatusForUser(user.id)
                        .then(
                            (badges) => {
                                let achievedCount: number = 0;
                                let models: Array<ApiBadgeModel> = badges
                                    .filter((badge) => {
                                        return badge.imageActivate && badge.imageDeactivate;
                                    })
                                    .map((badge) => {
                                        let badgeApiModel: ApiBadgeModel = {
                                            name: badge.name,
                                            achieved: badge.achieved,
                                            description: badge.achieved ? badge.congratulationText : badge.aimText,
                                        };

                                        if (badge.achieved && badge.imageActivate) {
                                            let image: Image = <Image>badge.imageActivate;
                                            badgeApiModel.imageUrl = image.uri;
                                        } else if (!badge.achieved && badge.imageDeactivate) {
                                            let image: Image = <Image>badge.imageDeactivate;
                                            badgeApiModel.imageUrl = image.uri;
                                        }

                                        achievedCount += badge.achieved ? 1 : 0;

                                        return badgeApiModel;
                                    });
                                response.status(200).json({
                                    badges: models,
                                    achievedCount: achievedCount
                                });
                            },
                            (error) => {
                                winston.error(error);
                                response.status(500).json(error);
                            }
                        )
                        .catch((error) => {
                            winston.error(error);
                            response.status(500).json(error);
                        });
                },
                (error) => {
                    winston.error(error);
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                winston.error(error);
                response.status(500).json(error);
            });
    }
}