"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = require("../../system/Controller");
const winston = require("winston");
class BadgeController {
    constructor(services) {
        this.badgeService = services.get('badgeService');
        this.userService = services.get('userService');
    }
    init(express) { }
    router(router) {
        router.get('/admin/badges', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.badgesPage(request, response); });
        router.post('/admin/badge/save', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.saveBadge(request, response); });
        router.get('/admin/badge/list/:page', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getBadgePage(request, response); });
        router.get('/admin/badge/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.getBadge(request, response); });
        router.delete('/admin/badge/:id', (request, response, next) => { this.userService.authenticationAdminMiddleware(request, response, next); }, (request, response) => { this.deleteBadge(request, response); });
        router.get('/api/badge/user/current', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getCurrentUserBadges(request, response); });
        router.get('/api/badge/user/:id', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getUserBadges(request, response); });
    }
    postInitialization() { }
    badgesPage(request, response) {
        response.render('badge/template/badges', {
            menuKey: BadgeController.BADGES_PAGE_MENU_KEY
        });
    }
    getBadge(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }
        this.badgeService.getBadge(id)
            .then((badge) => {
            if (badge && !badge.deleted) {
                response.status(200).json(badge);
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
    getBadgePage(request, response) {
        let page = parseInt(request.params.page);
        let perPage = parseInt(request.cookies['badgePerPage']) || Controller_1.DEFAULT_PER_PAGE;
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
    saveBadge(request, response) {
        this.badgeService.createModel(request)
            .then((badgeModel) => {
            this.badgeService.validate(badgeModel, request)
                .then((badgeModelValidation) => {
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
                }
                else {
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
    deleteBadge(request, response) {
        let id = parseInt(request.params.id);
        if (isNaN(id)) {
            response.status(400).json();
            return;
        }
        this.badgeService.deleteBadge(id)
            .then((badge) => {
            if (badge) {
                response.status(200).json(badge);
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
    getCurrentUserBadges(request, response) {
        let user = request.user;
        if (!user) {
            response.status(401).json();
            return;
        }
        this.badgeService.getAllBadgesWithAchievementStatusForUser(user.id)
            .then((badges) => {
            let achievedCount = 0;
            let models = badges
                .filter((badge) => {
                return badge.imageActivate && badge.imageDeactivate;
            })
                .map((badge) => {
                let badgeApiModel = {
                    name: badge.name,
                    achieved: badge.achieved,
                    description: badge.achieved ? badge.congratulationText : badge.aimText,
                };
                if (badge.achieved && badge.imageActivate) {
                    let image = badge.imageActivate;
                    badgeApiModel.imageUrl = 'http://' + request.header('host') + image.uri;
                }
                else if (!badge.achieved && badge.imageDeactivate) {
                    let image = badge.imageDeactivate;
                    badgeApiModel.imageUrl = 'http://' + request.header('host') + image.uri;
                }
                achievedCount += badge.achieved ? 1 : 0;
                return badgeApiModel;
            });
            response.status(200).json({
                badges: models,
                achievedCount: achievedCount
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
    getUserBadges(request, response) {
        let userId = request.params.id;
        if (!userId || isNaN(userId)) {
            response.status(400).json();
            return;
        }
        this.userService.getById(userId)
            .then((user) => {
            if (!user) {
                response.status(401).json();
                return;
            }
            this.badgeService.getAllBadgesWithAchievementStatusForUser(user.id)
                .then((badges) => {
                let achievedCount = 0;
                let models = badges
                    .filter((badge) => {
                    return badge.imageActivate && badge.imageDeactivate;
                })
                    .map((badge) => {
                    let badgeApiModel = {
                        name: badge.name,
                        achieved: badge.achieved,
                        description: badge.achieved ? badge.congratulationText : badge.aimText,
                    };
                    if (badge.achieved && badge.imageActivate) {
                        let image = badge.imageActivate;
                        badgeApiModel.imageUrl = 'http://' + request.header('host') + image.uri;
                    }
                    else if (!badge.achieved && badge.imageDeactivate) {
                        let image = badge.imageDeactivate;
                        badgeApiModel.imageUrl = 'http://' + request.header('host') + image.uri;
                    }
                    achievedCount += badge.achieved ? 1 : 0;
                    return badgeApiModel;
                });
                response.status(200).json({
                    badges: models,
                    achievedCount: achievedCount
                });
            }, (error) => {
                winston.error(error);
                response.status(500).json(error);
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
}
BadgeController.BADGES_PAGE_MENU_KEY = "admin_badges";
exports.default = BadgeController;
//# sourceMappingURL=index.js.map