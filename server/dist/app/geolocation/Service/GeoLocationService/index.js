"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Semi-axes of WGS-84 geoidal reference
exports.WGS84_A = 6378137.0; // Major semiaxis [m]
exports.WGS84_B = 6356752.3; // Minor semiaxis [m]
class GeoLocationService {
    getPointBounds(point, radius) {
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
    degToRad(degree) {
        return Math.PI * degree / 180.0;
    }
    radToDeg(radian) {
        return 180.0 * radian / Math.PI;
    }
    // Earth radius at a given latitude, according to the WGS-84 ellipsoid [m]
    wgs8484EarthRadius(latitudeRadians) {
        // http://en.wikipedia.org/wiki/Earth_radius
        let an = exports.WGS84_A * exports.WGS84_A * Math.cos(latitudeRadians);
        let bn = exports.WGS84_B * exports.WGS84_B * Math.sin(latitudeRadians);
        let ad = exports.WGS84_A * Math.cos(latitudeRadians);
        let bd = exports.WGS84_B * Math.sin(latitudeRadians);
        return Math.sqrt((an * an + bn * bn) / (ad * ad + bd * bd));
    }
}
exports.default = GeoLocationService;
//# sourceMappingURL=index.js.map