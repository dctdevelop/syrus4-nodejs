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
const Utils = require("./Utils");
const Redis_1 = require("./Redis");
/**
 * Geofences module get information about ApexOS
 * namespace for all the optiones is defined by application is not passed
 * @module Geofences
 */
/**
 * Add Geofence to the apx-tool
 * @param opts name: name of the fence, group: group that belongs the geofence, namespace: namespace that belongs of geofence, type; geofence type could be circular or poly; radius: if geofence is type circular radius is calculated in meters, minimum 50, lngLats, is an array with lon,lat coordinates of the geofence
 */
function addGeofence({ name, lngLats, group = "", namespace, type, radius }) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    if (!type)
        type = !!radius ? "circular" : "poly";
    if (type != "poly" && type != "circular")
        throw "unrecognized type of geofence";
    if (Array.isArray(lngLats))
        lngLats = lngLats.map(coord => coord.join(",")).join(" ");
    return Utils.OSExecute(`apx-geofences add ${namespace} ${group} ${type} ${name} ${radius || ""} ${lngLats}`);
}
/**
 * Update Geofence to the apx-tool
 * @param opts name: name of the fence, group: group that belongs the geofence, namespace: namespace that belongs of geofence, type; geofence type could be circular or poly; radius: if geofence is type circular radius is calculated in meters, minimum 50, lngLats, is an array with lon,lat coordinates of the geofence
 */
function updateGeofence(opts) {
    addGeofence(opts);
}
/**
 * Remove Geofence from the apx-tool
 * @param opts name: name of the fence, group: group that belongs the geofence, namespace: namespace that belongs of geofence
 */
function removeGeofence({ name, group = "", namespace }) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    return Utils.OSExecute(`apx-geofences remove ${namespace} ${group} ${name}`);
}
function getNamespaces() {
    return __awaiter(this, void 0, void 0, function* () {
        return Utils.OSExecute(`apx-geofences getns`);
    });
}
/**
 * Get state from Geofence from the apx-tool
 * @param opts name: name of the fence, group: group that belongs the geofence, namespace: namespace that belongs of geofence
 */
function get({ namespace = "", name = null } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!namespace) {
            namespace = Utils.getPrefix();
        }
        var results = yield Utils.OSExecute(`apx-geofences getstatus ${namespace}`);
        results = results.map(fence => {
            if (!fence.name)
                fence.name = fence.geo_name;
            fence.time = new Date(parseInt(fence.time) * 1000);
            return fence;
        });
        if (name) {
            return results.find(fence => fence.name == name);
        }
        return results;
    });
}
/**
 * Get states from  all Geofences from the apx-tool
 * @param opts namespace: namespace that belongs of geofence
 */
function getAll(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield get(opts);
    });
}
/**
 * remove all Geofences from the apx-tool
 * @param opts namespace: namespace that belongs of geofence
 */
function deleteAll({ namespace = null } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!namespace) {
            namespace = Utils.getPrefix();
        }
        return Utils.OSExecute(`apx-geofences remove ${namespace}`);
    });
}
/**
 *
 * @param callback callback to execute when a the device entered or exited from a geofence defined in the apx-tool
 * @param errorCb error callback to execute if something fails
 * @param opts namespace: namespace to check if entered or exited from geofence
 */
function watchGeofences(callback, errorCb, { namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    var handler = function (pattern, channel, data) {
        if (pattern !== `geofences/notification/${namespace}/*`)
            return;
        var [ns, group, name] = channel.replace(`geofences/notification/`, "").split("/");
        var [is_inside, timestamp] = data.split(",");
        callback({
            name: name,
            namespace: ns,
            group: group,
            is_inside: `${is_inside}` == "true",
            timestamp: new Date(parseInt(timestamp) * 1000)
        });
    };
    try {
        Redis_1.SystemRedisSubscriber.psubscribe(`geofences/notification/${namespace}/*`);
        Redis_1.SystemRedisSubscriber.on("pmessage", handler);
    }
    catch (error) {
        errorCb(error);
    }
    return {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("pmessage", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(`geofences/notification/${namespace}/*`);
        }
    };
}
/**
 *
 * @param callback callback to execute when a the device entered or exited from a group of geofenc defined in the apx-tool
 * @param errorCb error callback to execute if something fails
 * @param opts namespace: namespace to check if entered or exited from group of geofenc
 */
function watchGroups(callback, errorCb, { namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    var handler = function (pattern, channel, data) {
        if (pattern !== `geofences/group/notification/${namespace}/*`)
            return;
        var [ns, group_name] = channel.replace(`geofences/group/notification/`, "").split("/");
        var [is_inside, timestamp] = data.split(",");
        callback({
            name: group_name,
            namespace: ns,
            is_inside: `${is_inside}` == "true",
            timestamp: new Date(parseInt(timestamp) * 1000)
        });
    };
    try {
        Redis_1.SystemRedisSubscriber.psubscribe(`geofences/group/notification/${namespace}/*`);
        Redis_1.SystemRedisSubscriber.on("pmessage", handler);
    }
    catch (error) {
        errorCb(error);
    }
    return {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("pmessage", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(`geofences/group/notification/${namespace}/*`);
        }
    };
}
exports.default = { addGeofence, updateGeofence, removeGeofence, getNamespaces, get, getAll, watchGeofences, watchGroups, deleteAll };
