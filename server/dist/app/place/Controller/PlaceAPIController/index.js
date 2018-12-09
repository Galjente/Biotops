"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geolib = require("geolib");
const winston = require("winston");
class PlaceAPIController {
    constructor(services) {
        this.userService = services.get('userService');
        this.placeService = services.get('placeService');
        this.placeCategoryService = services.get('placeCategoryService');
        this.badgeAchievementService = services.get('badgeAchievementService');
    }
    init(express) { }
    router(router) {
        router.get('/api/place/nearest', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getNearestPlaces(request, response); });
        router.get('/api/place/all', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getAllPlacesApi(request, response); });
        router.get('/api/place/by_coordinate', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.placeByCoordinate(request, response); });
        router.get('/api/place/:id', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getPlaceApi(request, response); });
        router.get('/api/user/current/place/history', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getCurrentUserHistoryPlacesPlacesApi(request, response); });
        router.get('/api/user/:id/place/history', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getUserHistoryPlacesPlacesApi(request, response); });
        router.post('/api/place/checkin', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.placeCheckIn(request, response); });
        router.get('/api/place/top/10', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.getPlaceTopTen(request, response); });
        router.post('/api/place/search', (request, response, next) => { this.userService.authenticationMiddleware(request, response, next); }, (request, response) => { this.searchPlaces(request, response); });
    }
    postInitialization() { }
    getAllPlacesApi(request, response) {
        this.placeService.getAllPlaces()
            .then((places) => {
            let apiPlaces = places.map((place) => {
                let apiModel = {
                    id: place.id,
                    name: place.name,
                    region: place.region,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    previewImage: null,
                    images: place.images.map((image) => { return image.uri; }),
                    shortDescription: place.shortDescription,
                };
                if (apiModel.images.length) {
                    apiModel.previewImage = apiModel.images[0];
                }
                return apiModel;
            });
            response.status(200).json(apiPlaces);
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    getCurrentUserHistoryPlacesPlacesApi(request, response) {
        let currentUser = request.user;
        if (!currentUser) {
            response.status(401).json();
            return;
        }
        this.placeService.getUserHistoryPlaces(currentUser.id)
            .then((places) => {
            let apiPlaces = places.map((place) => {
                let apiModel = {
                    id: place.id,
                    name: place.name,
                    region: place.region,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    previewImage: null,
                    images: place.images.map((image) => { return image.uri; }),
                    shortDescription: place.shortDescription,
                };
                if (apiModel.images.length) {
                    apiModel.previewImage = apiModel.images[0];
                }
                return apiModel;
            });
            response.status(200).json(apiPlaces);
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    getUserHistoryPlacesPlacesApi(request, response) {
        let userId = parseInt(request.params.id);
        if (!userId || isNaN(userId)) {
            response.status(404).json();
            return;
        }
        this.placeService.getUserHistoryPlaces(userId)
            .then((places) => {
            let apiPlaces = places.map((place) => {
                let apiModel = {
                    id: place.id,
                    name: place.name,
                    region: place.region,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    previewImage: null,
                    images: place.images.map((image) => { return image.uri; }),
                    shortDescription: place.shortDescription,
                };
                if (apiModel.images.length) {
                    apiModel.previewImage = apiModel.images[0];
                }
                return apiModel;
            });
            response.status(200).json(apiPlaces);
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    getPlaceApi(request, response) {
        let user = request.user;
        let id = parseInt(request.params.id);
        let latitude = parseFloat(request.query.latitude);
        let longitude = parseFloat(request.query.longitude);
        if (isNaN(id)) {
            response.status(400).json({});
            return;
        }
        this.placeService.getPlace(id)
            .then((place) => {
            if (place) {
                this.placeService.getUserVisitedPlace(id, user)
                    .then((userVisitedPlace) => {
                    place['visited'] = userVisitedPlace != null;
                    if (!isNaN(latitude) || !isNaN(longitude)) {
                        place['distance'] = geolib.getDistance({ latitude: place.latitude, longitude: place.longitude }, { latitude: latitude, longitude: longitude });
                    }
                    place['previewImage'] = place.images.length ? place.images[0] : null;
                    response.status(200).json(place);
                }, (error) => {
                    response.status(500).json(error);
                })
                    .catch((error) => {
                    response.status(500).json(error);
                });
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
    placeCheckIn(request, response) {
        let currentUser = request.user;
        let placeId = parseInt(request.body.placeId);
        let latitude = parseFloat(request.body.latitude);
        let longitude = parseFloat(request.body.longitude);
        if (isNaN(placeId) || isNaN(latitude) || isNaN(longitude)) {
            response.status(400).json();
            return;
        }
        this.userService.getById(currentUser.id).then((user) => {
            this.placeService.getPlace(placeId).then((place) => {
                if (!place) {
                    response.status(400).json();
                    return;
                }
                this.placeService.placeCheckIn(user, place, { latitude: latitude, longitude: longitude }).then((visitedPlace) => {
                    if (visitedPlace) {
                        this.badgeAchievementService.achievementChecking(user.id, latitude, longitude);
                        response.status(200).json(visitedPlace);
                    }
                    else {
                        response.status(404).json();
                    }
                }, (error) => {
                    winston.error('Failed save visited place', error);
                    response.status(500).json(error);
                }).catch((error) => {
                    winston.error('Failed save visited place', error);
                    response.status(500).json(error);
                });
            }, (error) => {
                winston.error('Failed get place', error);
                response.status(500).json(error);
            }).catch((error) => {
                winston.error('Failed get place', error);
                response.status(500).json(error);
            });
        }, (error) => {
            winston.error('Failed get user', error);
            response.status(500).json();
        }).catch((error) => {
            winston.error('Failed get user', error);
            response.status(500).json();
        });
    }
    getNearestPlaces(request, response) {
        let latitude = parseFloat(request.query.latitude);
        let longitude = parseFloat(request.query.longitude);
        let distance = parseInt(request.query.distance);
        let limit = parseInt(request.query.limit);
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
        this.placeService.getNearestPlace({ latitude: latitude, longitude: longitude }, distance, limit)
            .then((places) => {
            let apiPlaces = places.map((place) => {
                let apiModel = {
                    id: place.id,
                    name: place.name,
                    region: place.region,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    images: place.images.map((image) => { return image.uri; }),
                    shortDescription: place.shortDescription,
                    previewImage: null,
                    distance: geolib.getDistance({ latitude: place.latitude, longitude: place.longitude }, { latitude: latitude, longitude: longitude })
                };
                if (apiModel.images.length) {
                    apiModel.previewImage = apiModel.images[0];
                }
                return apiModel;
            });
            response.status(200).json(apiPlaces);
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    placeByCoordinate(request, response) {
        let user = request.user;
        let latitude = parseFloat(request.query.latitude);
        let longitude = parseFloat(request.query.longitude);
        if (isNaN(latitude) || isNaN(longitude)) {
            response.status(400).json();
            return;
        }
        this.placeService.getPlaceByPoint({ latitude: latitude, longitude: longitude })
            .then((place) => {
            if (place) {
                this.placeService.getUserVisitedPlace(place.id, user)
                    .then((userVisitedPlace) => {
                    let apiPlace = {
                        id: place.id,
                        name: place.name,
                        region: place.region,
                        latitude: place.latitude,
                        longitude: place.longitude,
                        visited: userVisitedPlace != null,
                        images: place.images.map((image) => { return image.uri; }),
                        previewImage: null,
                        shortDescription: place.shortDescription,
                        distance: geolib.getDistance({ latitude: place.latitude, longitude: place.longitude }, { latitude: latitude, longitude: longitude })
                    };
                    if (apiPlace.images.length) {
                        apiPlace.previewImage = apiPlace.images[0];
                    }
                    response.status(200).json(apiPlace);
                }, (error) => {
                    response.status(500).json(error);
                })
                    .catch((error) => {
                    response.status(500).json(error);
                });
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
    getPlaceTopTen(request, response) {
        let latitude = parseFloat(request.query.latitude);
        let longitude = parseFloat(request.query.longitude);
        let locationAvailable = !isNaN(latitude) && !isNaN(longitude);
        this.placeService.getTopTenPlaces()
            .then((places) => {
            let apiPlaces = places.map((place) => {
                let apiPlaceModel = {
                    id: place.id,
                    name: place.name,
                    region: place.region,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    images: place.images.map((image) => { return image.uri; }),
                    previewImage: null,
                    shortDescription: place.shortDescription,
                };
                if (locationAvailable) {
                    apiPlaceModel['distance'] = geolib.getDistance({ latitude: place.latitude, longitude: place.longitude }, { latitude: latitude, longitude: longitude });
                }
                if (apiPlaceModel.images.length) {
                    apiPlaceModel.previewImage = apiPlaceModel.images[0];
                }
                return apiPlaceModel;
            });
            response.status(200).json(apiPlaces);
        }, (error) => {
            response.status(500).json(error);
        })
            .catch((error) => {
            response.status(500).json(error);
        });
    }
    searchPlaces(request, response) {
        let text = request.body.search;
        let categories = request.body.categories;
        this.placeService.searchPlace(text, categories).then((places) => {
            let apiPlaces = places.map((place) => {
                let apiModel = {
                    id: place.id,
                    name: place.name,
                    region: place.region,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    images: place.images.map((image) => { return image.uri; }),
                    previewImage: null,
                    shortDescription: place.shortDescription,
                };
                if (apiModel.images.length) {
                    apiModel.previewImage = apiModel.images[0];
                }
                return apiModel;
            });
            response.status(200).json(apiPlaces);
        }, (error) => {
            response.status(500).json(error);
        }).catch((error) => {
            response.status(500).json(error);
        });
    }
}
exports.default = PlaceAPIController;
//# sourceMappingURL=index.js.map