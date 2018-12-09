"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geolib = require("geolib");
const index_1 = require("../../Domain/Entity/UserVisitedPlace/index");
class PlaceService {
    constructor(services, daos) {
        this.placeDao = daos.get('placeDao');
        this.userVisitedPlaceDao = daos.get('userVisitedPlaceDao');
        this.placeCategoryService = services.get('placeCategoryService');
        this.geoLocationService = services.get('geoLocationService');
        this.storageService = services.get('storageService');
    }
    save(placeModel) {
        return this.placeDao.saveWithConnection({
            model: placeModel,
            onNewEntity: (entity, model) => { },
            onUpdateEntity: (entity, model) => {
                entity.name = model.name;
                entity.address = model.address;
                entity.region = model.region;
                entity.latitude = model.latitude;
                entity.longitude = model.longitude;
                entity.entranceFee = model.entranceFee ? 1 : 0;
                entity.note = model.note;
                entity.shortDescription = model.shortDescription;
                entity.description = model.description;
                entity.categories = model.categories;
                entity.published = model.published;
                entity.images = model.images;
            }
        });
    }
    getPage(page, perPage) {
        let criteria = new Map();
        criteria.set('deleted', false);
        return this.placeDao.findPageByCriteriaWithConnection(criteria, page, perPage);
    }
    getPlace(id) {
        return this.placeDao.findByIdWithConnection(id);
    }
    getUserVisitedPlace(placeId, user) {
        let criteria = new Map();
        criteria.set('user_fk', user.id);
        criteria.set('place_fk', placeId);
        return this.userVisitedPlaceDao.findOneByCriteriaWithConnection(criteria);
    }
    getAllPlaces() {
        let criteria = new Map();
        let searchFields = [{ field: 'name', direction: 'ASC' }];
        criteria.set('deleted', false);
        return this.placeDao.findAllByCriteriaWithConnection(criteria, searchFields);
    }
    getUserHistoryPlaces(userId) {
        return new Promise((resolve, reject) => {
            let criteria = new Map();
            criteria.set('user_fk', userId);
            this.userVisitedPlaceDao.findAllByCriteriaWithConnection(criteria)
                .then((userVisitedPlaces) => {
                let promises = [];
                userVisitedPlaces.forEach((userVisitedPlace) => {
                    promises.push(this.placeDao.findByIdWithConnection(userVisitedPlace.place));
                });
                Promise.all(promises)
                    .then((places) => {
                    resolve(places);
                }, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    placeCheckIn(user, place, point) {
        return new Promise((resolve, reject) => {
            let distance = geolib.getDistance({ latitude: place.latitude, longitude: place.longitude }, { latitude: point.latitude, longitude: point.longitude });
            if (distance > 1000.0) {
                resolve(null);
                return;
            }
            let visitedPlace = new index_1.default();
            visitedPlace.user = user;
            visitedPlace.place = place;
            visitedPlace.latitude = point.latitude;
            visitedPlace.longitude = point.longitude;
            this.userVisitedPlaceDao.saveEntityWithConnection(visitedPlace)
                .then(resolve, reject)
                .catch(reject);
        });
    }
    getNearestPlace(point, radius, limit) {
        let pointBounds = this.geoLocationService.getPointBounds(point, radius);
        return this.placeDao.findPlacesInBounds(point, pointBounds, limit);
    }
    getPlaceByPoint(point) {
        return new Promise((resolve, reject) => {
            let pointBounds = this.geoLocationService.getPointBounds(point, 50);
            this.placeDao.findPlacesInBounds(point, pointBounds)
                .then((places) => {
                if (places && places.length > 0) {
                    resolve(places[0]);
                }
                else {
                    resolve(null);
                }
            }, reject)
                .catch(reject);
        });
    }
    getTopTenPlaces() {
        return this.placeDao.findTopPlaces();
    }
    deletePlace(id) {
        return new Promise((resolve, reject) => {
            this.placeDao.findByIdWithConnection(id)
                .then((place) => {
                if (!place) {
                    resolve(place);
                    return;
                }
                place.deleted = true;
                this.placeDao.saveEntityWithConnection(place)
                    .then(resolve, reject)
                    .catch(reject);
            }, reject)
                .catch(reject);
        });
    }
    searchPlace(text, categories) {
        return this.placeDao.searchPlace(text, categories);
    }
    createModel(request) {
        return new Promise((resolve, reject) => {
            let content = request.body;
            if (content.categories && !Array.isArray(content.categories)) {
                content.categories = [content.categories];
            }
            if (content.images && !Array.isArray(content.images)) {
                content.images = [content.images];
            }
            content.categories = content.categories ? content.categories.map((value) => { return parseInt(value); }) : null;
            content.images = content.images ? content.images.map((value) => { return parseInt(value); }) : null;
            let placeModel = {
                id: content.id || undefined,
                name: content.name || '',
                address: content.address || '',
                region: content.region,
                latitude: content.latitude,
                longitude: content.longitude,
                entranceFee: content.entranceFee,
                note: content.note,
                shortDescription: content.shortDescription,
                description: content.description,
                published: content.published === 'on',
                categories: new Array(),
                images: new Array(),
            };
            let promises = [];
            if (content.categories && content.categories.length) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.placeCategoryService.getByIds(content.categories)
                        .then((categories) => {
                        placeModel.categories = categories;
                        resolve2();
                    }, reject2)
                        .catch(reject2);
                }));
            }
            if (content.images && content.images.length) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.storageService.getImages(content.images)
                        .then((images) => {
                        placeModel.images = images;
                        resolve2();
                    }, reject2)
                        .catch(reject2);
                }));
            }
            if (promises.length) {
                Promise.all(promises)
                    .then(() => {
                    resolve(placeModel);
                }, reject).catch(reject);
            }
            else {
                resolve(placeModel);
            }
        });
    }
    validate(model, request) {
        return new Promise((resolve, reject) => {
            resolve({
                valid: true
            });
        });
    }
}
exports.default = PlaceService;
//# sourceMappingURL=index.js.map