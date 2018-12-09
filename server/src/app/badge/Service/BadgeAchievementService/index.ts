'use strict';
import BadgeService from "../BadgeService/index";
import * as winston from "winston";
import PlaceService from "../../../place/Service/PlaceService/index";
import UserService from "../../../user/Service/UserService/index";
import UserVisitedPlaceDao from "../../../place/Domain/Dao/UserVisitedPlaceDao/index";
import Badge from "../../Domain/Entity/Badge/index";
import {CRUDDao} from "../../../system/CRUDDao";
import User from "../../../user/Domain/Entity/User/index";
import UserAchievedBadge from "../../Domain/Entity/UserAchievedBadge/index";
import UserAchievedBadgeDao from "../../Domain/DAO/UserAchievedBadgeDao/index";
import {IConnection} from "mysql";
import UserDao from "../../../user/Domain/DAO/UserDao/index";
import PlaceCategoryDao from "../../../place/Domain/Dao/PlaceCategoryDao/index";
import PlaceCategory from "../../../place/Domain/Entity/PlaceCategory/index";

export default class BadgeAchievementService {

    private userAchievedBadgeDao: UserAchievedBadgeDao;
    private userVisitedPlaceDao:UserVisitedPlaceDao;
    private userDao:UserDao;
    private placeCategoryDao:PlaceCategoryDao;

    private userService: UserService;
    private placeService:PlaceService;
    private badgeService:BadgeService;

    constructor(services: Map<string, any>, daos: Map<string, CRUDDao<any>>) {
        this.userAchievedBadgeDao = <UserAchievedBadgeDao>daos.get('userAchievedBadgeDao');
        this.userVisitedPlaceDao = <UserVisitedPlaceDao>daos.get('userVisitedPlaceDao');
        this.userDao = <UserDao>daos.get('userDao');
        this.placeCategoryDao = <PlaceCategoryDao>daos.get('placeCategoryDao');

        this.userService = services.get('userService');
        this.badgeService = services.get('badgeService');
        this.placeService = services.get('placeService');
    }

    achievementChecking(userId: number, latitude: number, longitude: number):void {
        this.badgeService.getAllBadgesWithAchievementStatusForUser(userId)
            .then(
                (badgesWithStatus) => {
                    let availableBadges = badgesWithStatus.filter((badgeWithStatus) => {
                        return !badgeWithStatus.achieved && badgeWithStatus.achievementFunctionName;
                    });

                    if (availableBadges.length) {
                        this.userAchievedBadgeDao.getConnection().then(
                            (connection) => {
                                let promises: Array<Promise<void>> = [];

                                this.userDao.findById(connection, userId).then(
                                    (user) => {
                                        availableBadges.forEach((badgeWithStatus) => {
                                            if (this[badgeWithStatus.achievementFunctionName]) {
                                                promises.push(this[badgeWithStatus.achievementFunctionName](connection, badgeWithStatus, user, latitude, longitude));
                                            } else {
                                                winston.error(`Can't find achievement function(${badgeWithStatus.achievementFunctionName})`);
                                            }
                                        });
                                    },
                                    (error) => {
                                        winston.error('Failed get user', error);
                                    }
                                ).catch((error) => {
                                    winston.error('Failed get user', error);
                                });

                                if (promises.length) {
                                    Promise.all(promises).then(
                                        () => {connection.release();},
                                        (error) => {connection.release();}
                                    ).catch((error) => {connection.release();});
                                } else {
                                    connection.release();
                                }
                            },
                            (error) => {
                                winston.error('Failed get connection for achievement checking')
                            }
                        ).catch((error) => {
                            winston.error('Failed get connection for achievement checking')
                        });
                    }
                },
                (error) => {
                    winston.error('Failed get badges with status', error);
                }
            ).catch((error) => {
                winston.error('Failed get badges with status', error);
            });
    }

    checkFirstPlaceCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 1);
    }

    checkThreePlaceInOneDayCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.maxUserVisitedPlacesInOneDay(connection, user.id)
                .then(
                    (count) => {
                        if (count >= 3) {
                            this.achieveBadge(connection, badge, user, latitude, longitude).then(
                                (userAchievedBadge) => {
                                    winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                                    resolve();
                                },
                                (error) => {
                                    winston.error('Failed save UserAchievedBadge', error);
                                    reject(error);
                                }
                            ).catch((error) => {
                                winston.error('Failed save UserAchievedBadge', error);
                                reject(error);
                            });
                        }
                    },
                    (error) => {
                        winston.error('Failed calculate visited places per day');
                        reject(error);
                    }
                ).catch((error) => {
                    winston.error('Failed calculate visited places per day');
                    reject(error);
                });
        });
    }

    checkFiveDayAppUsing(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        // FIXME implement calculation algorithm
        return Promise.resolve();
    }

    checkFiveMorningPlacesCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.countVisitedPlacesInTimeBetween(connection, user.id, '00:00:00', '06:00:00')
                .then(
                    (count) => {
                        if (count >= 5) {
                            this.achieveBadge(connection, badge, user, latitude, longitude).then(
                                (userAchievedBadge) => {
                                    winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                                    resolve();
                                },
                                (error) => {
                                    winston.error('Failed save UserAchievedBadge', error);
                                    reject(error);
                                }
                            ).catch((error) => {
                                winston.error('Failed save UserAchievedBadge', error);
                                reject(error);
                            });
                        }
                    },
                    (error) => {
                        winston.error('Failed cunt places in time(00:00:00 - 06:00:00) ', error);
                        reject(error);
                    }
                )
                .catch((error) => {
                        winston.error('Failed cunt places in time(00:00:00 - 06:00:00) ', error);
                        reject(error);
                    });
        });
    }

    checkTenFriends(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return new Promise((resolve, reject) => {
            if (user.friends.length > 9) {
                this.achieveBadge(connection, badge, user, latitude, longitude).then(
                    (userAchievedBadge) => {
                        winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                        resolve();
                    },
                    (error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    }
                ).catch((error) => {
                    winston.error('Failed save UserAchievedBadge', error);
                    reject(error);
                });
            }
        });
    }

    checkFiveFaunaPlacesCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, PlaceCategory.FAUNA_KEY, 5);
    }

    checkFirstFriend(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return new Promise((resolve, reject) => {
            if (user.friends.length > 0) {
                this.achieveBadge(connection, badge, user, latitude, longitude).then(
                    (userAchievedBadge) => {
                        winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                        resolve();
                    },
                    (error) => {
                        winston.error('Failed save UserAchievedBadge', error);
                        reject(error);
                    }
                ).catch((error) => {
                    winston.error('Failed save UserAchievedBadge', error);
                    reject(error);
                });
            }
        });
    }

    checkEarlyMorningPlaceCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.countVisitedPlacesInTimeBetween(connection, user.id, '04:00:00', '08:00:00')
                .then(
                    (count) => {
                        if (count >= 1) {
                            this.achieveBadge(connection, badge, user, latitude, longitude).then(
                                (userAchievedBadge) => {
                                    winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                                    resolve();
                                },
                                (error) => {
                                    winston.error('Failed save UserAchievedBadge', error);
                                    reject(error);
                                }
                            ).catch((error) => {
                                winston.error('Failed save UserAchievedBadge', error);
                                reject(error);
                            });
                        }
                    },
                    (error) => {
                        winston.error('Failed cunt places in time(04:00:00 - 08:00:00) ', error);
                        reject(error);
                    }
                )
                .catch((error) => {
                    winston.error('Failed cunt places in time(04:00:00 - 08:00:00) ', error);
                    reject(error);
                });
        });
    }

    check100PlaceCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 100);
    }

    check80PlaceCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 80);
    }

    check50PlaceCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlaceCountCheckIn(connection, badge, user, latitude, longitude, 50);
    }

    check100kmDistanceCheckInInOneDay(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        // FIXME implement calculation algorithm
        return Promise.resolve();
    }

    checkFiveFloraPlacesCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, PlaceCategory.FLORA_KEY, 5);
    }

    checkFiveGeoPlacesCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, PlaceCategory.GEO_KEY, 5);
    }

    checkFiveTowerPlacesCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, PlaceCategory.TOWER_KEY, 5);
    }

    checkFiveWaterPlacesCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, PlaceCategory.WATER_KEY, 5);
    }

    checkThreeMountainPlaceCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return this.checkPlacesCountCheckInByCategory(connection, badge, user, latitude, longitude, PlaceCategory.MOUNT_KEY, 5);
    }

    checkCheckInWithFriends(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number):Promise<void> {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.maxFriendsCounInOnePLace(connection, user.id)
                .then(
                    (count) => {
                        if (count >= 4) {
                            this.achieveBadge(connection, badge, user, latitude, longitude).then(
                                (userAchievedBadge) => {
                                    winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                                    resolve();
                                },
                                (error) => {
                                    winston.error('Failed save UserAchievedBadge', error);
                                    reject(error);
                                }
                            ).catch((error) => {
                                winston.error('Failed save UserAchievedBadge', error);
                                reject(error);
                            });
                        }
                    },
                    (error) => {
                        winston.error('Failed calculate friends count', error);
                        reject();
                    }
                ).catch((error) => {
                    winston.error('Failed calculate friends count', error);
                    reject();
                });
        });
    }

    private checkPlacesCountCheckInByCategory(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number, placeCategoryKey: string, requiredCount: number):Promise<void> {
        return new Promise((resolve, reject) => {
            let placeCategoryCriteria: Map<string, any> = new Map();
            placeCategoryCriteria.set('key', placeCategoryKey);
            this.placeCategoryDao.findOneByCriteria(connection, placeCategoryCriteria)
                .then(
                    (placeCategory) => {
                        if (placeCategory) {
                            this.userVisitedPlaceDao.countVisitedPlaceByCategory(connection, user.id, placeCategory.id)
                                .then(
                                    (count) => {
                                        if (count >= requiredCount) {
                                            this.achieveBadge(connection, badge, user, latitude, longitude).then(
                                                (userAchievedBadge) => {
                                                    winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                                                    resolve();
                                                },
                                                (error) => {
                                                    winston.error('Failed save UserAchievedBadge', error);
                                                    reject(error);
                                                }
                                            ).catch((error) => {
                                                winston.error('Failed save UserAchievedBadge', error);
                                                reject(error);
                                            });
                                        }
                                    },
                                    (error) => {
                                        winston.error('Failed calculate visited place by category');
                                        reject()
                                    }
                                ).catch((error) => {
                                winston.error('Failed calculate visited place by category');
                                reject()
                            });
                        } else {
                            winston.error(`Can't find Fauna category by 'key': "${PlaceCategory.FAUNA_KEY}"`);
                            reject()
                        }
                    },
                    (error) => {
                        winston.error('Filed find Fauna place category');
                        reject(error);
                    }
                ).catch((error) => {
                winston.error('Filed find Fauna place category');
                reject(error);
            });
        });
    }

    private checkPlaceCountCheckIn(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number, requiredCount: number):Promise<void> {
        return new Promise((resolve, reject) => {
            this.userVisitedPlaceDao.countUserVisitedPlaces(connection, user.id).then(
                (count) => {
                    if (count >= requiredCount) {
                        this.achieveBadge(connection, badge, user, latitude, longitude).then(
                            (userAchievedBadge) => {
                                winston.info(`User(${user.id}, ${user.name} ${user.surname}) got badge(${badge.name})`);
                                resolve();
                            },
                            (error) => {
                                winston.error('Failed save UserAchievedBadge', error);
                                reject(error);
                            }
                        ).catch((error) => {
                            winston.error('Failed save UserAchievedBadge', error);
                            reject(error);
                        });
                    }
                },
                (error) => {
                    winston.error('Failed get visited place count', error);
                    reject(error);
                }
            ).catch((error) => {
                winston.error('Failed get visited place count', error);
                reject(error);
            });
        });
    }

    private achieveBadge(connection: IConnection, badge: Badge, user: User, latitude: number, longitude: number): Promise<UserAchievedBadge> {
        let userAchievedBadge: UserAchievedBadge = new UserAchievedBadge();
        userAchievedBadge.user = user;
        userAchievedBadge.badge = badge;
        userAchievedBadge.latitude = latitude;
        userAchievedBadge.longitude = longitude;
        return this.userAchievedBadgeDao.saveEntity(connection, userAchievedBadge);
    }
}