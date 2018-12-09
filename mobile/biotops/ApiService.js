"use strict";
import {Platform} from 'react-native';
import {APP_SETTINGS} from "./settings";

export class ApiService {

	getTimeoutPromise() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				reject('Request timeout');
			}, APP_SETTINGS.timeout);
		});
	}

	getCommonRequest(url, jwtToken, onLogout) {
        let requestPromise = new Promise((resolve, reject) => {
            fetch(APP_SETTINGS.serverUrl + url, {
                method: 'GET',
                headers: APP_SETTINGS.headers(jwtToken),
            }).then((response) => {
                if (response.status == 200) {
                    response.json().then(
                        (jsonResponse) => {
                            resolve(jsonResponse);
                        },
                        reject
                    ).catch(reject);
                } else if (response.status === 401) {
                    resolve(null);
                    if (onLogout) {
                        onLogout();
                    }
                } else {
                    reject();
                }
            }).catch(reject);
        });
        return Promise.race([requestPromise, this.getTimeoutPromise()]);
    }

	getHistoryPlaces(userId, jwtToken, onLogout) {
        let url = `/api/user/` + (userId ? userId : 'current') + '/place/history';
        return this.getCommonRequest(url, jwtToken, onLogout);
    }

	getBadgeds(userId, jwtToken, onLogout) {
        let url = `/api/badge/user/` + (userId ? userId : 'current');
	    return this.getCommonRequest(url, jwtToken, onLogout);
    }

    getTopPosition(userId, jwtToken, onLogout) {
	    let url = `/api/user/` + (userId ? userId : 'current') + '/top/position';
        return this.getCommonRequest(url, jwtToken, onLogout);
    }

    getUserProfile(userId, jwtToken, onLogout) {
        let url = `/api/user/` + (userId ? userId : 'current') + '/profile';
        return this.getCommonRequest(url, jwtToken, onLogout);
    }

    getPlaceByCoordinates(jwtToken, onLogout, latitude, longitude) {
	    let url = `/api/place/by_coordinate?latitude=${latitude}&longitude=${longitude}`;
        return this.getCommonRequest(url, jwtToken, onLogout);
    }

    getTop10Places(jwtToken, onLogout) {
        let url = `/api/place/top/10`;
        return this.getCommonRequest(url, jwtToken, onLogout);
    }

    getAllPlaces(jwtToken, onLogout) {
        let url = `/api/place/all`;
        return this.getCommonRequest(url, jwtToken, onLogout);
    }

    getPlaceByIdAndCoordinates(jwtToken, onLogout, placeId, latitude, longitude) {
        let url = `/api/place/${placeId}?latitude=${latitude}&longitude=${longitude}`;
        return this.getCommonRequest(url, jwtToken, onLogout);
    }

	login(fbAccessToken) {
        let requestPromise = new Promise((resolve, reject) => {
            fetch(`${APP_SETTINGS.serverUrl}/api/login`, {
	            credentials: 'omit',
                method: 'POST',
                headers: APP_SETTINGS.headers(null),
                body: JSON.stringify({
                    accessToken: fbAccessToken
                })
            }).then((response) => {
                if (response.status == 200) {
                    response.json().then(
                        (jsonResponse) => {
                            resolve(jsonResponse.token);
                        },
                        reject
                    ).catch(reject);
                } else {
                    reject();
                }
            }).catch(reject);
        });
        return Promise.race([requestPromise, this.getTimeoutPromise()]);
	}

	sendErrorMessage(className, errorMessage, jwtToken, onSuccess, onError) {
		let os = Platform.OS;
		let osVersion = Platform.Version;
		let handleError = onError ? onError : (error) => {};
		let requestPromise = new Promise((resolve, reject) => {
            fetch(`${APP_SETTINGS.serverUrl}/api/device/error`, {
                method: 'POST',
                headers: APP_SETTINGS.headers(jwtToken),
                body: JSON.stringify({
					className: className,
					message: errorMessage,
					os:	os,
					version: osVersion,
				})
            }).then(
                (response) => {
                    resolve(response)
                },
                reject
            ).catch(reject);
		});
		Promise
			.race([requestPromise, this.getTimeoutPromise()])
			.then(
				(response) => {
                    if (response.status === 200) {
                    	if (onSuccess) {
                            onSuccess();
                        }
                    } else {
                        handleError();
					}
				},
                handleError
			).catch(handleError);
	}
}

const DEFAULT_API_SERVICE = new ApiService();
export default DEFAULT_API_SERVICE;