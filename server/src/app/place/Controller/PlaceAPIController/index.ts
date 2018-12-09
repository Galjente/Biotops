"use strict";
import {Application, Router, Request, Response, NextFunction} from "express";
import {Controller, DEFAULT_PER_PAGE} from "../../../system/Controller";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import PlaceService, {ApiPlaceModel} from "../../Service/PlaceService";
import PlaceCategoryService from "../../Service/PlaceCategoryService";
import UserService, {UserModel} from "../../../user/Service/UserService";
import User from "../../../user/Domain/Entity/User";
import * as geolib from 'geolib';
import Image from "../../../storage/Domain/Entity/Image/index";
import BadgeAchievementService from "../../../badge/Service/BadgeAchievementService/index";
import * as winston from "winston";

export default class PlaceAPIController implements Controller {

    private placeService:PlaceService;
    private placeCategoryService:PlaceCategoryService;
    private userService: UserService;
    private badgeAchievementService: BadgeAchievementService;

    constructor(services: Map<string, any>) {
        this.userService = services.get('userService');
        this.placeService = services.get('placeService');
        this.placeCategoryService = services.get('placeCategoryService');
        this.badgeAchievementService = services.get('badgeAchievementService');
    }

    init(express: Application): void {}

    router(router: Router): void {
        router.get('/api/place/nearest',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getNearestPlaces(request, response);});
        router.get('/api/place/all',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getAllPlacesApi(request, response)});
        router.get('/api/place/by_coordinate',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.placeByCoordinate(request, response);});

        router.get('/api/place/:id',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getPlaceApi(request, response)});

        router.get('/api/user/current/place/history',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getCurrentUserHistoryPlacesPlacesApi(request, response)});
        router.get('/api/user/:id/place/history',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getUserHistoryPlacesPlacesApi(request, response)});

        router.post('/api/place/checkin',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.placeCheckIn(request, response);});

        router.get('/api/place/top/10',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.getPlaceTopTen(request, response);});

        router.post('/api/place/search',
            (request: Request & RequestWithLocale, response: Response, next: NextFunction) => {this.userService.authenticationMiddleware(request, response, next);},
            (request: Request & RequestWithLocale, response: Response) => {this.searchPlaces(request, response);});
    }

    postInitialization(): void {}

    getAllPlacesApi(request: Request & RequestWithLocale, response: Response) {
        this.placeService.getAllPlaces()
            .then(
                (places) => {
                    let apiPlaces: Array<ApiPlaceModel> = places.map(
                        (place) => {
                            let apiModel = {
                                id: place.id,
                                name: place.name,
                                region: place.region,
                                latitude: place.latitude,
                                longitude: place.longitude,
                                previewImage: null,
                                images: place.images.map((image) => {return (<Image>image).uri;}),
                                shortDescription: place.shortDescription,
                            };
                            if (apiModel.images.length) {
                                apiModel.previewImage = apiModel.images[0];
                            }

                            return apiModel
                        }
                    );
                    response.status(200).json(apiPlaces);
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getCurrentUserHistoryPlacesPlacesApi(request: Request & RequestWithLocale, response: Response) {
        let currentUser: UserModel = request.user;
        if (!currentUser) {
            response.status(401).json();
            return;
        }
        this.placeService.getUserHistoryPlaces(currentUser.id)
            .then(
                (places) => {
                    let apiPlaces: Array<ApiPlaceModel> = places.map(
                        (place) => {
                            let apiModel = {
                                id: place.id,
                                name: place.name,
                                region: place.region,
                                latitude: place.latitude,
                                longitude: place.longitude,
                                previewImage: null,
                                images: place.images.map((image) => {return (<Image>image).uri;}),
                                shortDescription: place.shortDescription,
                            };
                            if (apiModel.images.length) {
                                apiModel.previewImage = apiModel.images[0];
                            }
                            return apiModel;
                        }
                    );
                    response.status(200).json(apiPlaces);
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getUserHistoryPlacesPlacesApi(request: Request & RequestWithLocale, response: Response) {
        let userId = parseInt(request.params.id);
        if (!userId || isNaN(userId)) {
            response.status(404).json();
            return;
        }
        this.placeService.getUserHistoryPlaces(userId)
            .then(
                (places) => {
                    let apiPlaces: Array<ApiPlaceModel> = places.map(
                        (place) => {
                            let apiModel = {
                                id: place.id,
                                name: place.name,
                                region: place.region,
                                latitude: place.latitude,
                                longitude: place.longitude,
                                previewImage: null,
                                images: place.images.map((image) => {return (<Image>image).uri;}),
                                shortDescription: place.shortDescription,
                            };
                            if (apiModel.images.length) {
                                apiModel.previewImage = apiModel.images[0];
                            }
                            return apiModel;
                        }
                    );
                    response.status(200).json(apiPlaces);
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch((error) => {
                response.status(500).json(error);
            });
    }

    getPlaceApi(request: Request & RequestWithLocale, response: Response) {
        let user:User = request.user;
        let id:number = parseInt(request.params.id);
        let latitude: number = parseFloat(request.query.latitude);
        let longitude: number = parseFloat(request.query.longitude);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }

        this.placeService.getPlace(id)
            .then((place) => {
                if (place) {
                    this.placeService.getUserVisitedPlace(id, user)
                        .then(
                            (userVisitedPlace) => {
                                place['visited'] = userVisitedPlace != null;
                                if (!isNaN(latitude) || !isNaN(longitude)) {
                                    place['distance'] = geolib.getDistance(
                                        { latitude: place.latitude, longitude: place.longitude },
                                        { latitude: latitude, longitude: longitude }
                                    )
                                }

                                place['previewImage'] = place.images.length ? place.images[0] : null;

                                response.status(200).json(place);
                            },
                            (error) => {
                                response.status(500).json(error);
                            }
                        )
                        .catch((error) => {
                            response.status(500).json(error);
                        });
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

    placeCheckIn(request: Request & RequestWithLocale, response: Response) {
        let currentUser: UserModel = request.user;
        let placeId: number = parseInt(request.body.placeId);
        let latitude: number = parseFloat(request.body.latitude);
        let longitude: number = parseFloat(request.body.longitude);

        if (isNaN(placeId) || isNaN(latitude) || isNaN(longitude)) {
            response.status(400).json();
            return;
        }

        this.userService.getById(currentUser.id).then(
            (user) => {
                this.placeService.getPlace(placeId).then(
                    (place) => {
                        if (!place) {
                            response.status(400).json();
                            return;
                        }

                        this.placeService.placeCheckIn(user, place, {latitude: latitude, longitude: longitude}).then(
                            (visitedPlace) => {
                                if (visitedPlace) {
                                    this.badgeAchievementService.achievementChecking(user.id, latitude, longitude);
                                    response.status(200).json(visitedPlace);
                                } else {
                                    response.status(404).json();
                                }
                            },
                            (error) => {
                                winston.error('Failed save visited place', error);
                                response.status(500).json(error);
                            }
                        ).catch((error) => {
                            winston.error('Failed save visited place', error);
                            response.status(500).json(error);
                        });
                    },
                    (error) => {
                        winston.error('Failed get place', error);
                        response.status(500).json(error);
                    }
                ).catch(
                    (error) => {
                        winston.error('Failed get place', error);
                        response.status(500).json(error);
                    }
                );
            },
            (error) => {
                winston.error('Failed get user', error);
                response.status(500).json();
            }
        ).catch((error) => {
            winston.error('Failed get user', error);
            response.status(500).json();
        });
    }

    getNearestPlaces(request: Request & RequestWithLocale, response: Response) {
        let latitude: number = parseFloat(request.query.latitude);
        let longitude: number = parseFloat(request.query.longitude);
        let distance: number = parseInt(request.query.distance);
        let limit: number = parseInt(request.query.limit);

        if (isNaN(latitude) || isNaN(longitude)) {
            response.status(400).json();
            return;
        }

        if (isNaN(distance) || distance < 3000) {
            distance = 3000;
        }

        if (isNaN(limit) || limit <= 0) {
            limit = 3;
        }

        this.placeService.getNearestPlace({latitude: latitude, longitude: longitude}, distance, limit)
            .then(
                (places) => {
                    let apiPlaces: Array<ApiPlaceModel> = places.map(
                        (place) => {
                            let apiModel = {
                                id: place.id,
                                name: place.name,
                                region: place.region,
                                latitude: place.latitude,
                                longitude: place.longitude,
                                images: place.images.map((image) => {return (<Image>image).uri;}),
                                shortDescription: place.shortDescription,
                                previewImage: null,
                                distance: geolib.getDistance(
                                    { latitude: place.latitude, longitude: place.longitude },
                                    { latitude: latitude, longitude: longitude }
                                )
                            };

                            if (apiModel.images.length) {
                                apiModel.previewImage = apiModel.images[0];
                            }

                            return apiModel;
                        }
                    );
                    response.status(200).json(apiPlaces);
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch(
                (error) => {
                    response.status(500).json(error);
                }
            );
    }

    placeByCoordinate(request: Request & RequestWithLocale, response: Response) {
        let user:User = request.user;
        let latitude: number = parseFloat(request.query.latitude);
        let longitude: number = parseFloat(request.query.longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            response.status(400).json();
            return;
        }

        this.placeService.getPlaceByPoint({latitude: latitude, longitude: longitude})
            .then(
                (place) => {
                    if (place) {
                        this.placeService.getUserVisitedPlace(place.id, user)
                            .then(
                                (userVisitedPlace) => {
                                    let apiPlace = {
                                        id: place.id,
                                        name: place.name,
                                        region: place.region,
                                        latitude: place.latitude,
                                        longitude: place.longitude,
                                        visited: userVisitedPlace != null,
                                        images: place.images.map((image) => {return (<Image>image).uri;}),
                                        previewImage: null,
                                        shortDescription: place.shortDescription,
                                        distance: geolib.getDistance(
                                            { latitude: place.latitude, longitude: place.longitude },
                                            { latitude: latitude, longitude: longitude }
                                        )
                                    };

                                    if (apiPlace.images.length) {
                                        apiPlace.previewImage = apiPlace.images[0];
                                    }

                                    response.status(200).json(apiPlace);
                                },
                                (error) => {
                                    response.status(500).json(error);
                                }
                            )
                            .catch((error) => {
                                response.status(500).json(error);
                            });
                    } else {
                        response.status(404).json();
                    }
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch(
                (error) => {
                    response.status(500).json(error);
                }
            );
    }

    getPlaceTopTen(request: Request & RequestWithLocale, response: Response) {
        let latitude: number = parseFloat(request.query.latitude);
        let longitude: number = parseFloat(request.query.longitude);
        let locationAvailable = !isNaN(latitude) && !isNaN(longitude);

        this.placeService.getTopTenPlaces()
            .then(
                (places) => {
                    let apiPlaces: Array<ApiPlaceModel> = places.map(
                        (place) => {
                            let apiPlaceModel =  {
                                id: place.id,
                                name: place.name,
                                region: place.region,
                                latitude: place.latitude,
                                longitude: place.longitude,
                                images: place.images.map((image) => {return (<Image>image).uri;}),
                                previewImage: null,
                                shortDescription: place.shortDescription,
                            };

                            if (locationAvailable) {
                                apiPlaceModel['distance'] = geolib.getDistance(
                                    { latitude: place.latitude, longitude: place.longitude },
                                    { latitude: latitude, longitude: longitude }
                                );
                            }

                            if (apiPlaceModel.images.length) {
                                apiPlaceModel.previewImage = apiPlaceModel.images[0];
                            }

                            return apiPlaceModel;
                        }
                    );
                    response.status(200).json(apiPlaces);
                },
                (error) => {
                    response.status(500).json(error);
                }
            )
            .catch(
                (error) => {
                    response.status(500).json(error);
                }
            );
    }

    searchPlaces(request: Request & RequestWithLocale, response: Response) {
        let text: string = request.body.search;
        let categories: Array<number> = request.body.categories;

        this.placeService.searchPlace(text, categories).then(
            (places) => {
                let apiPlaces: Array<ApiPlaceModel> = places.map(
                    (place) => {
                        let apiModel = {
                            id: place.id,
                            name: place.name,
                            region: place.region,
                            latitude: place.latitude,
                            longitude: place.longitude,
                            images: place.images.map((image) => {return (<Image>image).uri;}),
                            previewImage: null,
                            shortDescription: place.shortDescription,
                        };

                        if (apiModel.images.length) {
                            apiModel.previewImage = apiModel.images[0];
                        }

                        return apiModel;
                    }
                );
                response.status(200).json(apiPlaces);
            },
            (error) => {
                response.status(500).json(error);
            }
        ).catch((error) => {
            response.status(500).json(error);
        });
    }
}