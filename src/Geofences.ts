import Utils from "./Utils";
import { redisSubscriber as subscriber } from "./Redis";
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
		var arr = `${__dirname}`.split("node_modules/")[0].split("/");
		arr.pop();
		namespace = arr.pop();
	}

	if (!type) type = !!radius ? "circular" : "poly";
	if (type != "poly" && type != "circular") throw "unrecognized type of geofence";
	if (Array.isArray(lngLats)) lngLats = lngLats.map(coord => coord.join(",")).join(" ");

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
		var arr = `${__dirname}`.split("node_modules/")[0].split("/");
		arr.pop();
		namespace = arr.pop();
	}
	return Utils.OSExecute(`apx-geofences remove ${namespace} ${group} ${name}`);
}

/**
 * Get state from Geofence from the apx-tool
 * @param opts name: name of the fence, group: group that belongs the geofence, namespace: namespace that belongs of geofence
 */
async function get({ namespace = "", name = null } = {}) {
	if (!namespace) {
		var arr = `${__dirname}`.split("node_modules/")[0].split("/");
		arr.pop();
		namespace = arr.pop();
	}
	var results: any = await Utils.OSExecute(`apx-geofences getstatus ${namespace}`);

	results = results.map(fence => {
		fence.time = new Date(parseInt(fence.time) * 1000);
		return fence;
	});
	if (name) {
		return results.find(fence => fence.name == name);
	}

	return results;
}

/**
 * Get states from  all Geofences from the apx-tool
 * @param opts namespace: namespace that belongs of geofence
 */
async function getAll(opts) {
	return await get(opts);
}

/**
 * remove all Geofences from the apx-tool
 * @param opts namespace: namespace that belongs of geofence
 */
async function deleteAll({ namespace=null } = {}) {
	if (!namespace) {
		var arr = `${__dirname}`.split("node_modules/")[0].split("/");
		arr.pop();
		namespace = arr.pop();
	}
	return Utils.OSExecute(`apx-geofences remove ${namespace}`);
}


/**
 *
 * @param callback callback to execute when a the device entered or exited from a geofence defined in the apx-tool
 * @param errorCb error callback to execute if something fails
 * @param opts namespace: namespace to check if entered or exited from geofence
*/
function watchGeofences(callback, errorCb, { namespace = null } = {}) {
	if (!namespace) {
		var arr = `${__dirname}`.split("node_modules/")[0].split("/");
		arr.pop();
		namespace = arr.pop();
	}

	var handler = function (pattern, channel, data) {
		if (pattern !== `geofences/notification/${namespace}/*`) return;
		console.log(channel, data);
		var [group, name] = channel.replace(`geofences/notification/${namespace}/`, "").split("/");
		var [is_inside, timestamp] = data.split(",");
		callback({
			name: name,
			group: group,
			is_inside: `${is_inside}` == "true",
			timestamp: new Date(parseInt(timestamp) * 1000)
		});
	};
	try {
		subscriber.psubscribe(`geofences/notification/${namespace}/*`);
		subscriber.on("pmessage", handler);
	} catch (error) {
		errorCb(error);
	}
	return {
		unsubscribe: () => {
			subscriber.off("pmessage", handler);
			subscriber.unsubscribe(`geofences/notification/${namespace}/*`);
		}
	};
}

export default { addGeofence, updateGeofence, removeGeofence, get, getAll, watchGeofences, deleteAll };
