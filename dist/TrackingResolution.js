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
const Redis_1 = require("./Redis");
const Utils_1 = require("./Utils");
function rawdataToCoordinates(raw) {
    var gps = JSON.parse(raw);
    var speed = parseFloat(gps.speed) * 0.277778;
    return {
        coords: {
            latitude: gps.lat,
            longitude: gps.lon,
            speed: speed,
            accuracy: 5 * gps.hdop || 20000,
            altitude: gps.alt,
            bearing: speed,
            altitudeAccuracy: 5 * gps.vdop
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
/**
 * define a tracking resolution using apx-tracking tool to receive filtered data gps
 * @param callback callback to execute when new data arrive from tracking resolution
 * @param opts tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   heading:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000)
 */
function watchTrackingResolution(callback, { distance = 0, heading = 0, time = 0, namespace, prefix, deleteOnExit = true }) {
    if (!prefix) {
        var arr = `${execSync('pwd').toString().replace("\n","")}`.split("/");
        arr.pop();
        prefix = arr.pop();
    }
    if (!namespace) {
        throw "Namespace is required";
    }
    var name = `${prefix}_${namespace}`;
    if (!(!heading && !time && !distance))
        Utils_1.default.OSExecute(`apx-tracking set "${name}" ${heading} ${time} ${distance}`);
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
 * @param opts tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   heading:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000)
 */
function setTrackingResolution({ distance = 0, heading = 0, time = 0, namespace, prefix, deleteOnExit = true }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!prefix) {
            var arr = `${execSync('pwd').toString().replace("\n","")}`.split("/");
            arr.pop();
            prefix = arr.pop();
        }
        if (!namespace) {
            throw "Namespace is required";
        }
        var name = `${prefix}_${namespace}`;
        yield Utils_1.default.OSExecute(`apx-tracking set "${name}" ${heading} ${time} ${distance}`);
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
exports.default = { watchTrackingResolution, getActiveTrackingsResolutions, setTrackingResolution };
