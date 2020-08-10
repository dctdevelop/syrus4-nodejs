import Utils from "./Utils";
import { redisSubscriber as subscriber } from "./Redis";
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

	if (type != "poly" && type != "circular") throw "unrecognized type of geofence";

	if (Array.isArray(lngLats)) {
		lngLats = lngLats.map(coord => coord.join(",")).join(" ");
	}

	return Utils.OSExecute(`apx-geofences add ${namespace} ${group} ${type} ${radius || ""} ${name} ${lngLats}`);
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
	return Utils.OSExecute(`apx-geofences delete ${namespace} ${group} ${type} ${radius || ""} ${name} ${lngLats}`);
}

async function get({ namespace, name }) {
	if (!namespace) {
		var arr = `${__dirname}`.split("/");
		arr.pop();
		namespace = arr.pop();
	}
    var results:any = await  Utils.OSExecute(`apx-geofences getall ${namespace}`);
    if(name){
        return results.find((fence)=> fence.name == name);
    }

    return results;
}

async function getAll(opts) {
	return await get(opts);
}


function watchGeofences(callback, errorCb, {namespace}){
    if (!namespace) {
		var arr = `${__dirname}`.split("/");
		arr.pop();
		namespace = arr.pop();
    }

	var handler = function (pattern, channel, data) {
        if (pattern !== `geofences/notification/${namespace}/*`) return;
        var [group, name] = channel.replace(`geofences/notification/${namespace}/`, "").split("/");
        var [is_inside, timestamp] = data.split("/");
		callback({
            name: name,
            group: group,
            is_inside: is_inside == "true",
            timestamp: new Date(parseInt(timestamp)* 1000)
        });
    };
    try {
        subscriber.psubscribe(`geofences/notification/${namespace}/*`);
        subscriber.on("pmessage", handler);

    } catch (error) {
        return errorCb(error);
    }
}



export default { addGeofence, updateGeofence, removeGeofence, get, getAll, watchGeofences };
