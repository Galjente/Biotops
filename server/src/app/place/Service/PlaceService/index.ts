"use strict";
import {Request} from 'express';
import {ModelValidation, ValidationService} from "../../../system/ValidationService";
import {RequestWithLocale} from "../../../system/RequestWithLocale";
import Place from "../../Domain/Entity/Place/index";
import {CRUDDao, SearchOption} from "../../../system/CRUDDao";
import PlaceDao from "../../Domain/Dao/PlaceDao/index";
import PlaceCategory from "../../Domain/Entity/PlaceCategory/index";
import PlaceCategoryService from "../PlaceCategoryService/index";
import User from "../../../user/Domain/Entity/User/index";
import UserVisitedPlaceDao from "../../Domain/Dao/UserVisitedPlaceDao/index";
import * as geolib from 'geolib';
import UserVisitedPlace from "../../Domain/Entity/UserVisitedPlace/index";
import {default as GeoLocationService, Point, PointBounds} from "../../../geolocation/Service/GeoLocationService/index";
import ImageDao from "../../../storage/Domain/DAO/ImageDao/index";
import Image from "../../../storage/Domain/Entity/Image/index";
import StorageService from "../../../storage/Service/StorageService/index";

export interface PlaceModel {
    id?: number;
    name: string;
    address: string;
    region: string;
    latitude: number;
    longitude: number;
    entranceFee: boolean;
    note: string;
    shortDescription: string;
    description: string;
    categories: Array<PlaceCategory>;
    images: Array<Image>;
    published: boolean;
}

export interface PlaceModelValidation extends ModelValidation {
    id?: string;
}

export interface ApiPlaceModel {
    id: number;
    name: string;
    region: string;
    latitude: number;
    longitude: number;
}

export default class PlaceService implements ValidationService<PlaceModel> {


    private placeDao: PlaceDao;
    private userVisitedPlaceDao: UserVisitedPlaceDao;

    private placeCategoryService: PlaceCategoryService;
    private geoLocationService: GeoLocationService;
    private storageService: StorageService;


    constructor(services: Map<string, any>, daos: Map<string, CRUDDao<any>>) {
        this.placeDao = <PlaceDao>daos.get('placeDao');
        this.userVisitedPlaceDao = <UserVisitedPlaceDao>daos.get('userVisitedPlaceDao');

        this.placeCategoryService = services.get('placeCategoryService');
        this.geoLocationService = services.get('geoLocationService');
        this.storageService = services.get('storageService');
    }

    save(placeModel: PlaceModel): Promise<Place> {
        return this.placeDao.saveWithConnection({
            model: placeModel,
            onNewEntity:    (entity, model) => {},
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
                entity.images = model.images
            }
        });
    }

    getPage(page: number, perPage: number): Promise<RestPage<Place>> {
        let criteria: Map<string, any> = new Map();
        criteria.set('deleted', false);
        return this.placeDao.findPageByCriteriaWithConnection(criteria, page, perPage);
    }

    getPlace(id:number): Promise<Place> {
     return this.placeDao.findByIdWithConnection(id);
    }

    getUserVisitedPlace(placeId: number, user: User): Promise<UserVisitedPlace> {
        let criteria:Map<string, any> = new Map();
        criteria.set('user_fk', user.id);
        criteria.set('place_fk', placeId);
        return this.userVisitedPlaceDao.findOneByCriteriaWithConnection(criteria)
    }

    getAllPlaces(): Promise<Array<Place>> {
        let criteria: Map<string, any> = new Map();
        let searchFields: Array<SearchOption> = [{field: 'name', direction: 'ASC'}];
        criteria.set('deleted', false);

        return this.placeDao.findAllByCriteriaWithConnection(criteria, searchFields);
    }

    getUserHistoryPlaces(userId: number): Promise<Array<Place>> {
        return new Promise((resolve, reject) => {
            let criteria: Map<string, any> = new Map();
            criteria.set('user_fk', userId);
            this.userVisitedPlaceDao.findAllByCriteriaWithConnection(criteria)
                .then(
                    (userVisitedPlaces) => {
                        let promises: Array<Promise<Place>> = [];
                        userVisitedPlaces.forEach((userVisitedPlace) => {
                            promises.push(this.placeDao.findByIdWithConnection(<number>userVisitedPlace.place));
                        });
                        Promise.all(promises)
                            .then(
                                (places) => {
                                    resolve(places);
                                },
                                reject
                            )
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    placeCheckIn(user: User, place: Place, point: Point): Promise<UserVisitedPlace> {
        return new Promise((resolve, reject) => {
            let distance: number = geolib.getDistance(
                { latitude: place.latitude, longitude: place.longitude },
                { latitude: point.latitude, longitude: point.longitude }
            );

            if (distance > 1000.0) {
                resolve(null);
                return;
            }

            let visitedPlace: UserVisitedPlace = new UserVisitedPlace();
            visitedPlace.user = user;
            visitedPlace.place = place;
            visitedPlace.latitude = point.latitude;
            visitedPlace.longitude = point.longitude;

            this.userVisitedPlaceDao.saveEntityWithConnection(visitedPlace)
                .then(resolve, reject)
                .catch(reject);
        });
    }

    getNearestPlace(point: Point, radius: number, limit: number): Promise<Array<Place>> {
        let pointBounds: PointBounds = this.geoLocationService.getPointBounds(point, radius);
        return this.placeDao.findPlacesInBounds(point, pointBounds, limit);
    }

    getPlaceByPoint(point: Point): Promise<Place> {
        return new Promise((resolve, reject) => {
            let pointBounds: PointBounds = this.geoLocationService.getPointBounds(point, 50);
            this.placeDao.findPlacesInBounds(point, pointBounds)
                .then(
                    (places) => {
                        if (places && places.length > 0) {
                            resolve(places[0]);
                        } else {
                            resolve(null);
                        }
                    },
                    reject
                )
                .catch(reject);
        });
    }

    getTopTenPlaces(): Promise<Array<Place>> {
       return this.placeDao.findTopPlaces();
    }

    deletePlace(id: number): Promise<Place> {
        return new Promise((resolve, reject) => {
            this.placeDao.findByIdWithConnection(id)
                .then(
                    (place) => {
                        if (!place) {
                            resolve(place);
                            return;
                        }
                        place.deleted = true;
                        this.placeDao.saveEntityWithConnection(place)
                            .then(resolve, reject)
                            .catch(reject);
                    },
                    reject
                )
                .catch(reject);
        });
    }

    searchPlace(text: string, categories: Array<number>): Promise<Array<Place>> {
        return this.placeDao.searchPlace(text, categories);
    }

    createModel(request: Request & RequestWithLocale): Promise<PlaceModel> {
        return new Promise((resolve, reject) => {
            let content: any = request.body;
            if (content.categories && !Array.isArray(content.categories)) {
                content.categories = [content.categories];
            }

            if (content.images && !Array.isArray(content.images)) {
                content.images = [content.images];
            }

            content.categories = content.categories ? content.categories.map((value) => {return parseInt(value);}) : null;
            content.images = content.images ? content.images.map((value) => {return parseInt(value);}) : null;

            let placeModel: PlaceModel = {
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

            let promises: Array<Promise<void>> = [];

            if (content.categories && content.categories.length) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.placeCategoryService.getByIds(content.categories)
                        .then(
                            (categories) => {
                                placeModel.categories = categories;
                                resolve2();
                            },
                            reject2
                        )
                        .catch(reject2)
                }));
            }


            if (content.images && content.images.length) {
                promises.push(new Promise((resolve2, reject2) => {
                    this.storageService.getImages(content.images)
                        .then(
                            (images) => {
                                placeModel.images = images;
                                resolve2();
                            },
                            reject2
                        )
                        .catch(reject2);
                }));
            }

            if (promises.length) {
                Promise.all(promises)
                    .then(
                        () => {
                            resolve(placeModel);
                        },
                        reject
                    ).catch(reject);
            } else {
                resolve(placeModel);
            }
        });
    }

    validate(model: PlaceModel, request: Request & RequestWithLocale): Promise<PlaceModelValidation> {
        return new Promise((resolve, reject) => {
            resolve({
                valid: true
            });
        });
    }
}