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
const Utils_1 = require("./Utils");
const Redis_1 = require("./Redis");
/**
 * Geofences module get information about ApexOS
 * @module Geofences
 */
function addGeofence({ name, lngLats, group = "", namespace, type, radius }) {
    if (!namespace) {
        var arr = `${__dirname}`.split("/");
        arr.pop();
        namespace = arr.pop();
    }
    if (type != "poly" && type != "circular")
        throw "unrecognized type of geofence";
    if (Array.isArray(lngLats)) {
        lngLats = lngLats.map(coord => coord.join(",")).join(" ");
    }
    return Utils_1.default.OSExecute(`apx-geofences add ${namespace} ${group} ${type} ${radius || ""} ${name} ${lngLats}`);
}
function updateGeofence(opts) {
    addGeofence(opts);
}
function removeGeofence({ name, lngLats, group = "", namespace, type, radius }) {
    if (!namespace) {
        var arr = `${__dirname}`.split("/");
        arr.pop();
        namespace = arr.pop();
    }
    return Utils_1.default.OSExecute(`apx-geofences delete ${namespace} ${group} ${type} ${radius || ""} ${name} ${lngLats}`);
}
function get({ namespace, name }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!namespace) {
            var arr = `${__dirname}`.split("/");
            arr.pop();
            namespace = arr.pop();
        }
        var results = yield Utils_1.default.OSExecute(`apx-geofences getall ${namespace}`);
        if (name) {
            return results.find((fence) => fence.name == name);
        }
        return results;
    });
}
function getAll(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield get(opts);
    });
}
function watchGeofences(callback, errorCb, { namespace }) {
    if (!namespace) {
        var arr = `${__dirname}`.split("/");
        arr.pop();
        namespace = arr.pop();
    }
    var handler = function (pattern, channel, data) {
        if (pattern !== `geofences/notification/${namespace}/*`)
            return;
        var [group, name] = channel.replace(`geofences/notification/${namespace}/`, "").split("/");
        var [is_inside, timestamp] = data.split("/");
        callback({
            name: name,
            group: group,
            is_inside: is_inside == "true",
            timestamp: new Date(parseInt(timestamp) * 1000)
        });
    };
    try {
        Redis_1.redisSubscriber.psubscribe(`geofences/notification/${namespace}/*`);
        Redis_1.redisSubscriber.on("pmessage", handler);
    }
    catch (error) {
        return errorCb(error);
    }
}
exports.default = { addGeofence, updateGeofence, removeGeofence, get, getAll, watchGeofences };
