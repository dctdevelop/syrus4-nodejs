"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * GPS module get information about gps and location in ApexOS
 * @module GPS
 */
const Redis = require("ioredis");
const Utils_1 = require("./Utils");
var redis = new Redis();
const MAX_TRIES = 3;
var tries = 0;
function rawdataToCoordinates(raw) {
    var gps = JSON.parse(raw);
    return {
        coords: {
            latitude: gps.lat,
            longitude: gps.lon,
            speed: gps.speed,
            accuracy: 5 * gps.hdop,
            altitude: gps.alt,
            bearing: gps.track,
            altitudeAccuracy: 5 * gps.vdop
        },
        timestamp: new Date(gps.time).getTime() / 1000,
        extras: {
            hdop: gps.hdop,
            vdop: gps.vdop,
            pdop: gps.pdop,
            quality: gps.quality,
            fix: gps.fix,
            satsActive: gps.satsActive,
            satsVisible: gps.satsVisible
        }
    };
}
function evaluateCriteria(current, last, config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }) {
    if (config.accuracy > 0 && current.coords.accuracy > config.accuracy) {
        tries++;
        if (tries > MAX_TRIES) {
            tries = 0;
            return true;
        }
        else {
            return false;
        }
    }
    if (!last)
        return true;
    var distance = Utils_1.default.distanceBetweenCoordinates(last, current);
    var secs = new Date(current.timestamp).getTime() - new Date(last.timestamp).getTime();
    var bearing = Math.abs(last.coords.bearing - current.coords.bearing);
    if (config.distance > 0 && distance < config.distance)
        return false;
    if (config.time > 0 && secs < config.time)
        return false;
    if (config.bearing > 0 && bearing < config.bearing)
        return false;
    return true;
}
/**
 * Get last current location from GPS
 */
function getCurrentLocation() {
    return __awaiter(this, void 0, void 0, function* () {
        return rawdataToCoordinates(yield redis.get("gps"));
    });
}
/**
 * allows to subscribe to position events in GPS module
 * @param callback handler to execute when new gps position arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 * @param config Object coniguration how evaluate criteria for watchPosition
 */
function watchPosition(callback, errorCallback, config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }) {
    var last = null;
    var handler = function (_channel, gps) {
        var position = rawdataToCoordinates(gps);
        if (evaluateCriteria(position, last)) {
            callback(position);
            last = position;
        }
    };
    redis.subscribe("gps");
    redis.on("message", handler);
    return {
        unsubscribe: () => {
            redis.off("gps", handler);
            redis.unsubscribe("gps");
        }
    };
}
/**
 * allows to subscribe to gps data changes in GPS module
 * @param callback handler to execute when new gps data arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 */
function watchGPS(callback, errorCallback) {
    redis.subscribe("gps");
    redis.on("message", function (_channel, gps) {
        callback(gps);
    });
    return {
        unsubscribe: () => {
            redis.off("gps", callback);
            redis.unsubscribe("gps");
        }
    };
}
exports.default = {
    getCurrentLocation,
    watchPosition,
    watchGPS
};
