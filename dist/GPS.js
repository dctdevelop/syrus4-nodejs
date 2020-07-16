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
const Redis_1 = require("./Redis");
const Utils_1 = require("./Utils");
function rawdataToCoordinates(raw) {
    var gps = JSON.parse(raw);
    var speed = parseFloat(gps.speed) * 0.277778;
    return {
        coords: {
            latitude: gps.lat || 0,
            longitude: gps.lon || 0,
            speed: speed,
            accuracy: 5 * gps.hdop || 20000,
            altitude: gps.alt || 0,
            bearing: speed,
            altitudeAccuracy: 5 * gps.vdop || 0
        },
        timestamp: new Date(gps.time).getTime() / 1000,
        extras: {
            hdop: gps.hdop,
            vdop: gps.vdop,
            pdop: gps.pdop,
            quality: gps.quality,
            fix: gps.fix,
            satsActive: gps.satused,
            satsVisible: gps.satview,
            criteria: gps.type
        }
    };
}
function evaluateCriteria(current, last = null, config = { hdop: 3, distance: 0, time: 0, bearing: 0 }) {
    if (config.hdop > 0 && current.extras.hdop > config.hdop) {
        return false;
    }
    if (!last)
        return "signal";
    var criteria = config.distance == 0 && config.time == 0 && config.bearing == 0 ? "accuracy" : false;
    var distance = Utils_1.default.distanceBetweenCoordinates(last, current) * 1000;
    var secs = Math.abs(new Date(current.timestamp).getTime() - new Date(last.timestamp).getTime()) / 1000;
    var bearing = Math.abs(last.coords.bearing - current.coords.bearing);
    if (config.distance > 0 && distance >= config.distance)
        criteria = "distance";
    if (config.time > 0 && secs >= config.time)
        criteria = "time";
    if (config.bearing > 0 && bearing >= config.bearing)
        criteria = "heading";
    return criteria;
}
/**
 * Get last current location from GPS
 */
function getCurrentPosition(config = { hdop: 0, distance: 0, time: 0, bearing: 0 }) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            var timeoutToTransmit;
            var handler = function (channel, gps) {
                if (channel != "gps")
                    return;
                var position = rawdataToCoordinates(gps);
                if (!position.coords.latitude)
                    return;
                var criteria = evaluateCriteria(position);
                if (!config || !!criteria) {
                    Redis_1.redisSubscriber.off("message", handler);
                    position.extras.criteria = criteria;
                    resolve(position);
                    clearTimeout(timeoutToTransmit);
                }
            };
            Redis_1.redisSubscriber.on("message", handler);
            if (config.time > 0) {
                clearTimeout(timeoutToTransmit);
            }
            Redis_1.redisSubscriber.subscribe("gps");
            if (config.time > 0) {
                timeoutToTransmit = setTimeout(() => {
                    Redis_1.redisSubscriber.off("message", handler);
                    resolve(rawdataToCoordinates("{}"));
                }, config.time);
            }
        }
        catch (error) {
            reject(error);
        }
    }));
}
/**
 * allows to subscribe to position events in GPS module
 * @param callback handler to execute when new gps position arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 * @param config Object coniguration how evaluate criteria for watchPosition
 */
function watchPosition(callback, errorCallback, config = { hdop: 0, distance: 0, time: 0, bearing: 0 }) {
    var last_returned = null;
    var last_valid = rawdataToCoordinates("{}");
    var intervalToTransmit = null;
    var handler = function (channel, gps) {
        if (channel !== "gps")
            return;
        var position = rawdataToCoordinates(gps);
        if (!position.coords.latitude)
            return;
        last_valid = position;
        var criteria = evaluateCriteria(position, last_returned, config);
        if (!!criteria) {
            callback(position, criteria);
            last_returned = position;
            if (config.time > 0) {
                clearInterval(intervalToTransmit);
                intervalToTransmit = setInterval(() => {
                    callback(last_valid, "time");
                }, config.time);
            }
        }
    };
    Redis_1.redisSubscriber.subscribe("gps");
    Redis_1.redisSubscriber.on("message", handler);
    if (config.time > 0) {
        intervalToTransmit = setInterval(() => {
            callback(last_valid, "time");
        }, config.time);
    }
    return {
        unsubscribe: () => {
            clearInterval(intervalToTransmit);
            Redis_1.redisSubscriber.off("message", handler);
        }
    };
}
/**
 * allows to subscribe to gps data changes in GPS module
 * @param callback handler to execute when new gps data arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 */
function watchGPS(callback, errorCallback) {
    try {
        Redis_1.redisSubscriber.subscribe("gps");
        var cb = function (channel, gps) {
            if (channel !== "gps")
                return;
            callback(gps);
        };
        Redis_1.redisSubscriber.on("message", cb);
        return {
            unsubscribe: () => {
                Redis_1.redisSubscriber.off("message", cb);
            }
        };
    }
    catch (error) {
        if (errorCallback)
            errorCallback(error);
        else
            console.error(error);
    }
}
/**
 * define a tracking resolution using apx-tracking tool to receive filtered data gps
 * @param callback callback to execute when new data arrive from tracking resolution
 * @param opts tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   bearing:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000)
 */
function watchTrackingResolution(callback, { distance = 0, bearing = 0, time = 0, namespace, prefix, deleteOnExit = true }) {
    if (!prefix) {
        var arr = `${__dirname}`.split("node_modules/")[0].split("/");
        arr.pop();
        prefix = arr.pop();
    }
    if (!namespace) {
        throw "Namespace is required";
    }
    var name = `${prefix}_${namespace}`;
    if (!(!bearing && !time && !distance))
        Utils_1.default.OSExecute(`apx-tracking set "${name}" ${bearing} ${time} ${distance}`);
    var handler = function (channel, gps) {
        if (channel !== `tracking/notification/${name}`)
            return;
        var position = rawdataToCoordinates(gps);
        callback(position, position.extras.criteria);
    };
    Redis_1.redisSubscriber.subscribe(`tracking/notification/${name}`);
    Redis_1.redisSubscriber.on("message", handler);
    if (deleteOnExit) {
        function exitHandler() {
            process.stdin.resume();
            Utils_1.default.OSExecute(`apx-tracking delete "${name}"`);
            setTimeout(() => { process.exit(); }, 10);
        }
        //do something when app is closing
        process.on("exit", exitHandler);
        //catches ctrl+c event
        process.on("SIGINT", exitHandler);
        // catches "kill pid" (for example: nodemon restart)
        process.on("SIGUSR1", exitHandler);
        process.on("SIGUSR2", exitHandler);
        //catches uncaught exceptions
        process.on("uncaughtException", exitHandler);
    }
    return {
        unsubscribe: () => {
            Utils_1.default.OSExecute(`apx-tracking delete "${name}"`);
            Redis_1.redisSubscriber.off("message", handler);
            Redis_1.redisSubscriber.unsubscribe(`tracking/notification/${name}`);
        }
    };
}
/**
 *  get all the active tracking resolutions`in the apex tol apx-tracking
 * @param prefixed prefix to lookup tracking_resolution
 */
function getActiveTrackingsResolutions(prefixed = "") {
    return __awaiter(this, void 0, void 0, function* () {
        var tracks = yield Utils_1.default.OSExecute(`apx-tracking getall`);
        var response = {};
        for (const key in tracks) {
            if (!key.startsWith(prefixed))
                continue;
            const track = tracks[key];
            response[key] = { heading: track[0], time: track[1], distance: track[2] };
        }
        return response;
    });
}
/**
 * set options for a tracking_resolution for the apex tool apx-tracking
 * @param opts tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   bearing:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000)
 */
function setTrackingResolution({ distance = 0, bearing = 0, time = 0, namespace, prefix, deleteOnExit = true }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!prefix) {
            var arr = `${__dirname}`.split("node_modules/")[0].split("/");
            arr.pop();
            prefix = arr.pop();
        }
        if (!namespace) {
            throw "Namespace is required";
        }
        var name = `${prefix}_${namespace}`;
        yield Utils_1.default.OSExecute(`apx-tracking set "${name}" ${bearing} ${time} ${distance}`);
        if (deleteOnExit) {
            function exitHandler() {
                process.stdin.resume();
                Utils_1.default.OSExecute(`apx-tracking delete "${name}"`);
                setTimeout(() => { process.exit(); }, 10);
            }
            //do something when app is closing
            process.on("exit", exitHandler);
            //catches ctrl+c event
            process.on("SIGINT", exitHandler);
            // catches "kill pid" (for example: nodemon restart)
            process.on("SIGUSR1", exitHandler);
            process.on("SIGUSR2", exitHandler);
            //catches uncaught exceptions
            process.on("uncaughtException", exitHandler);
        }
        return true;
    });
}
exports.default = {
    getCurrentPosition,
    watchPosition,
    watchGPS,
    watchTrackingResolution,
    getActiveTrackingsResolutions,
    setTrackingResolution,
};
