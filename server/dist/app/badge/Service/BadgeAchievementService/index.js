'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const index_1 = require("../../Domain/Entity/UserAchievedBadge/index");
const index_2 = require("../../../place/Domain/Entity/PlaceCategory/index");
class BadgeAchievementService {
    constructor(services, daos) {
        this.userAchievedBadgeDao = daos.get('userAchievedBadgeDao');
        this.userVisitedPlaceDao = daos.get('userVisitedPlaceDao');
        this.userDao = daos.get('userDao');
        this.placeCategoryDao = daos.get('placeCategoryDao');
        this.userService = services.get('userService');
        this.badgeService = services.get('badgeService');
        this.placeService = services.get('placeService');
    }
    achievementChecking(userId, latitude, longitude) {
        this.badgeService.getAllBadgesWithAchievementStatusForUser(userId)
            .then((badgesWithStatus) => {
            let availableBadges = badgesWithStatus.filter((badgeWithStatus) => {
                return !badgeWithStatus.achieved && badgeWithStatus.achievementFunctionName;
            });
            if (availableBadges.length) {
                this.userAchievedBadgeDao.getConnection().then((connection) => {
                    let promises = [];
                    this.userDao.findById(connection, userId).then((user) => {
                        availableBadges.forEach((badgeWithStatus) => {
                            if (this[badgeWithStatus.achievementFunctionName]) {
                                promises.push(this[badgeWithStatus.achievementFunctionName](connection, badgeWithStatus, user, latitude, longitude));
                            }
                            else {
                                winston.error(`Can't find achievement function(${badgeWithStatus.achievementFunctionName})`);
                            }
                        });
                    }, (error) => {
                        winston.error('Failed get user', error);
                    }).catch((error) => {
                        winston.error('Failed get user', error);
                    });
                    if (promises.length) {
                        Promise.all(promises).then(() => { connection.release(); }, (error) => { connection.release(); }).catch((error) => { connection.release(); });
                    }
                    else {
                        connection.release();
                    }
                }, (error) => {
                    winston.error('Failed get connection for achievement checking');
                }).catch((error) => {
                    winston.error('Failed get connection for achievement checking');
                });
            }
        }, (error) => {
            winston.error('Failed get badges with status', error);
        }).catch((error) => {
            winston.error('Failed get badges with status', error);
        });
    }
    checkFirstPlaceCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 1);
    }
    checkThreePlaceInOneDayCheckIn(connection, badge, user, latitude, longitude) {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.maxUserVisitedPlacesInOneDay(connection, user.id)
                .then((count) => {
                if (count >= 3) {
                    this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                        winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                        resolve();
                    }, (error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    }).catch((error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    });
                }
            }, (error) => {
                winston.error('Failed calculate visited places per day');
                reject(error);
            }).catch((error) => {
                winston.error('Failed calculate visited places per day');
                reject(error);
            });
        });
    }
    checkFiveDayAppUsing(connection, badge, user, latitude, longitude) {
        // FIXME implement calculation algorithm
        return Promise.resolve();
    }
    checkFiveMorningPlacesCheckIn(connection, badge, user, latitude, longitude) {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.countVisitedPlacesInTimeBetween(connection, user.id, '00:00:00', '06:00:00')
                .then((count) => {
                if (count >= 5) {
                    this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                        winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                        resolve();
                    }, (error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    }).catch((error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    });
                }
            }, (error) => {
                winston.error('Failed cunt places in time(00:00:00 - 06:00:00) ', error);
                reject(error);
            })
                .catch((error) => {
                winston.error('Failed cunt places in time(00:00:00 - 06:00:00) ', error);
                reject(error);
            });
        });
    }
    checkTenFriends(connection, badge, user, latitude, longitude) {
        return new Promise((resolve, reject) => {
            if (user.friends.length > 9) {
                this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                    winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                    resolve();
                }, (error) => {
                    winston.error('Failed save UserAchievedBadge', error);
                    reject(error);
                }).catch((error) => {
                    winston.error('Failed save UserAchievedBadge', error);
                    reject(error);
                });
            }
        });
    }
    checkFiveFaunaPlacesCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, index_2.default.FAUNA_KEY, 5);
    }
    checkFirstFriend(connection, badge, user, latitude, longitude) {
        return new Promise((resolve, reject) => {
            if (user.friends.length > 0) {
                this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                    winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                    resolve();
                }, (error) => {
                    winston.error('Failed save UserAchievedBadge', error);
                    reject(error);
                }).catch((error) => {
                    winston.error('Failed save UserAchievedBadge', error);
                    reject(error);
                });
            }
        });
    }
    checkEarlyMorningPlaceCheckIn(connection, badge, user, latitude, longitude) {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.countVisitedPlacesInTimeBetween(connection, user.id, '04:00:00', '08:00:00')
                .then((count) => {
                if (count >= 1) {
                    this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                        winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                        resolve();
                    }, (error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    }).catch((error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    });
                }
            }, (error) => {
                winston.error('Failed cunt places in time(04:00:00 - 08:00:00) ', error);
                reject(error);
            })
                .catch((error) => {
                winston.error('Failed cunt places in time(04:00:00 - 08:00:00) ', error);
                reject(error);
            });
        });
    }
    check100PlaceCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 100);
    }
    check80PlaceCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 80);
    }
    check50PlaceCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 50);
    }
    check100kmDistanceCheckInInOneDay(connection, badge, user, latitude, longitude) {
        // FIXME implement calculation algorithm
        return Promise.resolve();
    }
    checkFiveFloraPlacesCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, index_2.default.FLORA_KEY, 5);
    }
    checkFiveGeoPlacesCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, index_2.default.GEO_KEY, 5);
    }
    checkFiveTowerPlacesCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, index_2.default.TOWER_KEY, 5);
    }
    checkFiveWaterPlacesCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, index_2.default.WATER_KEY, 5);
    }
    checkThreeMountainPlaceCheckIn(connection, badge, user, latitude, longitude) {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, index_2.default.MOUNT_KEY, 5);
    }
    checkCheckInWithFriends(connection, badge, user, latitude, longitude) {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.maxFriendsCounInOnePLace(connection, user.id)
                .then((count) => {
                if (count >= 4) {
                    this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                        winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                        resolve();
                    }, (error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    }).catch((error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    });
                }
            }, (error) => {
                winston.error('Failed calculate friends count', error);
                reject();
            }).catch((error) => {
                winston.error('Failed calculate friends count', error);
                reject();
            });
        });
    }
    checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, placeCategoryKey, requiredCount) {
        return new Promise((resolve, reject) => {
            let placeCategoryCriteria = new Map();
            placeCategoryCriteria.set('key', placeCategoryKey);
            this.placeCategoryDao.findOneByCriteria(connection, placeCategoryCriteria)
                .then((placeCategory) => {
                if (placeCategory) {
                    this.userVisitedPlaceDao.countVisitedPlaceByCategory(connection, user.id, placeCategory.id)
                        .then((count) => {
                        if (count >= requiredCount) {
                            this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                                winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                                resolve();
                            }, (error) => {
                                winston.error('Failed save UserAchievedBadge', error);
                                reject(error);
                            }).catch((error) => {
                                winston.error('Failed save UserAchievedBadge', error);
                                reject(error);
                            });
                        }
                    }, (error) => {
                        winston.error('Failed calculate visited place by category');
                        reject();
                    }).catch((error) => {
                        winston.error('Failed calculate visited place by category');
                        reject();
                    });
                }
                else {
                    winston.error(`Can't find Fauna category by 'key': "${index_2.default.FAUNA_KEY}"`);
                    reject();
                }
            }, (error) => {
                winston.error('Filed find Fauna place category');
                reject(error);
            }).catch((error) => {
                winston.error('Filed find Fauna place category');
                reject(error);
            });
        });
    }
    checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, requiredCount) {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.countUserVisitedPlaces(connection, user.id).then((count) => {
                if (count >= requiredCount) {
                    this.achieveBadge(connection, badge, user, latitude, longitude).then((userAchievedBadge) => {
                        winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                        resolve();
                    }, (error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    }).catch((error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    });
                }
            }, (error) => {
                winston.error('Failed get visited place count', error);
                reject(error);
            }).catch((error) => {
                winston.error('Failed get visited place count', error);
                reject(error);
            });
        });
    }
    achieveBadge(connection, badge, user, latitude, longitude) {
        let userAchievedBadge = new index_1.default();
        userAchievedBadge.user = user;
        userAchievedBadge.badge = badge;
        userAchievedBadge.latitude = latitude;
        userAchievedBadge.longitude = longitude;
        return this.userAchievedBadgeDao.saveEntity(connection, userAchievedBadge);
    }
}
exports.default = BadgeAchievementService;
//# sourceMappingURL=index.js.map