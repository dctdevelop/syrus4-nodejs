"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = __importStar(require("./Utils"));
const Redis_1 = require("./Redis");
/**
 * Geofences module
 * @module Geofences
 */
/**
 * Add Geofence to the apx-tool
 * @param opts options hash
 * name: name of the fence;
 * lngLats: array of (lon,lat) coordinate pairs;
 * group: group name;
 * namespace: namespace;
 * type: geofence type could be circular or poly;
 * radius: radius for circular fences, in meters, must be >= 50;
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
 * @param opts options hash
 * name: name of the fence;
 * lngLats: array of (lon,lat) coordinate pairs;
 * group: group name;
 * namespace: namespace;
 * type: geofence type could be circular or poly;
 * radius: radius for circular fences, in meters, must be >= 50;
 */
function updateGeofence(opts) {
    addGeofence(opts);
}
/**
 * Remove Geofence from the apx-tool
 * @param opts options hash
 * name: name of the fence;
 * group: group name;
 * namespace: namespace;
 */
function removeGeofence({ name, group = "", namespace }) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    return Utils.OSExecute(`apx-geofences remove ${namespace} ${group} ${name}`);
}
/**
 * get all available namespaces
 * @return {*}
 */
async function getNamespaces() {
    return Utils.OSExecute(`apx-geofences getns`);
}
/**
 * Get geofence state from the apx-tool
 * @param opts options hash
 * name: name of the fence;
 * namespace: namespace;
 */
async function get({ namespace = "", name = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    var results = await Utils.OSExecute(`apx-geofences getstatus ${namespace}`);
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
}
/**
 * Get states from all Geofences for a given namespace
 * @param opts options hash
 * namespace: namespace that belongs of geofence;
 */
async function getAll(opts) {
    return await get(opts);
}
/**
 * Get the list of geofences in wich the device is currently inside
 * @params namespace
 * namespace: The desired namespace to query
 */
async function getInside(namespace) {
    return await Utils.OSExecute(`apx-geofences getinside ${namespace}`);
}
/**
 * remove all Geofences from the namespace
 * @param opts options hash
 * namespace: namespace that belongs of geofence;
 */
async function deleteAll({ namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    return Utils.OSExecute(`apx-geofences remove ${namespace}`);
}
/**
 *
 * @param callback callback to execute when the device enters or exits from a geofence
 * @param errorCb error callback to execute if there is an unexpected error
 * @param opts options hash
 * namespace: namespace to check if entered or exited from geofence;
 */
async function watchGeofences(callback, errorCb, { namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    /* Get last state */
    const lastGeofenceState = await Utils.OSExecute(`apx-geofences getstatus ${namespace}`).catch(console.error);
    const lastGeoObject = JSON.parse(JSON.stringify(lastGeofenceState));
    if (lastGeoObject != undefined) {
        callback(lastGeoObject);
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
 * @param callback callback to execute when the device enters or exits a geofence group
 * @param errorCb error callback to execute if something fails
 * @param opts
 * namespace: namespace to check if entered or exited from group of geofence;
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
