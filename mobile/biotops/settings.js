"use strict";

export const APP_SETTINGS = {
    serverUrl:  'https://dabastops.lv',
    headers: function(token) {
        let headerParameters = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (token) {
            headerParameters['Authorization'] = `bearer ${token}`;
        }
        return headerParameters;
    },
    timeout: 5000,
    locationSettings: {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 5
    }
};