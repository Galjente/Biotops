"use strict";

export interface Point {
    latitude: number;
    longitude: number;
}

export interface PointBounds {
    min: Point,
    max: Point
}

// Semi-axes of WGS-84 geoidal reference
export const WGS84_A:number = 6378137.0; // Major semiaxis [m]
export const WGS84_B:number = 6356752.3; // Minor semiaxis [m]

export default class GeoLocationService {

    getPointBounds(point:Point, radius: number):PointBounds {
        if (radius < 0) {
            return null;
        }
        let latitudeRadians = this.degToRad(point.latitude);
        let longitudeRadians = this.degToRad(point.longitude);

        let earthRadius = this.wgs8484EarthRadius(latitudeRadians);
        let parallelRadius = earthRadius * Math.cos(latitudeRadians);

        let latitudeCoefficient = radius / earthRadius;
        let longitudeCoefficient = radius / parallelRadius;

        let minLatitudeRadians = latitudeRadians - latitudeCoefficient;
        let minLongitudeRadians = longitudeRadians - longitudeCoefficient;
        let maxLatitudeRadians = latitudeRadians + latitudeCoefficient;
        let maxLongitudeRadians = longitudeRadians + longitudeCoefficient;

        return {
            min: {
                latitude: this.radToDeg(minLatitudeRadians),
                longitude: this.radToDeg(minLongitudeRadians)
            },
            max: {
                latitude: this.radToDeg(maxLatitudeRadians),
                longitude: this.radToDeg(maxLongitudeRadians)
            }
        };
    }

    degToRad(degree: number):number {
        return Math.PI * degree / 180.0;
    }

    radToDeg(radian: number):number {
        return 180.0 * radian / Math.PI;
    }

    // Earth radius at a given latitude, according to the WGS-84 ellipsoid [m]
    wgs8484EarthRadius(latitudeRadians: number): number {
        // http://en.wikipedia.org/wiki/Earth_radius
        let an = WGS84_A * WGS84_A * Math.cos(latitudeRadians);
        let bn = WGS84_B * WGS84_B * Math.sin(latitudeRadians);
        let ad = WGS84_A * Math.cos(latitudeRadians);
        let bd = WGS84_B * Math.sin(latitudeRadians);

        return Math.sqrt((an*an + bn*bn) / (ad*ad + bd*bd));
    }
}