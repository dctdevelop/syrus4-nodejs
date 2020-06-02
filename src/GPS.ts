/**
 * GPS module get information about gps and location in ApexOS
 * @module GPS
 */
import { redisSubscriber as subscriber, redisClient as redis } from "./Redis";
import utils from "./Utils";
const MAX_TRIES = 3;
const SPEED_THRESHOLD = 3;
var tries = 0;
function rawdataToCoordinates(raw: string) {
	var gps = JSON.parse(raw);
	var speed = parseFloat(gps.speed) * 0.277778;
	return {
		coords: {
			latitude: gps.lat || 0,
			longitude: gps.lon || 0,
			speed: speed >= SPEED_THRESHOLD ? speed : 0,
			accuracy: 5 * gps.hdop || 20000,
			altitude: gps.alt || 0,
			bearing: speed >= SPEED_THRESHOLD ? gps.track : 0,
			altitudeAccuracy: 5 * gps.vdop || 0
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

function evaluateCriteria(current, last = null, config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }): boolean {
	if (config.accuracy > 0 && current.coords.accuracy > config.accuracy) {
		tries++;
		if (tries > MAX_TRIES) {
			tries = 0;
			return true;
		} else {
			return false;
		}
	}

	if (!last) return true;
	var criteria = config.distance == 0 && config.time == 0 && config.bearing == 0;
	var distance = utils.distanceBetweenCoordinates(last, current);
	var secs = Math.abs(new Date(current.timestamp).getTime() - new Date(last.timestamp).getTime()) / 1000;
	var bearing = Math.abs(last.coords.bearing - current.coords.bearing);
	if (config.distance > 0 && distance >= config.distance) criteria = true;
	if (config.time > 0 && secs >= config.time) criteria = true;
	if (config.bearing > 0 && bearing >= config.bearing) criteria = true;
	return criteria;
}

/**
 * Get last current location from GPS
 */
function getCurrentPosition(config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }) {
	return new Promise(async (resolve, reject) => {
		try {
			var handler = function (channel, gps) {
				if (channel != "gps") return;
				var position = rawdataToCoordinates(gps);
				if(!position.coords.latitude) return;
				if (!config || evaluateCriteria(position)) {
					resolve(position);
				}
			};
			subscriber.on("message", handler);
			subscriber.subscribe("gps");
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * allows to subscribe to position events in GPS module
 * @param callback handler to execute when new gps position arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 * @param config Object coniguration how evaluate criteria for watchPosition
 */
function watchPosition(callback: Function, errorCallback: Function, config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }) {
	var last = null;
	var handler = function (channel, gps) {
		if(channel !== "gps") return;
		var position = rawdataToCoordinates(gps);
		if(!position.coords.latitude) return;
		if (evaluateCriteria(position, last, config)) {
			callback(position);
			last = position;
		}
	};
	redis.subscribe("gps");
	redis.on("message", handler);

	return {
		unsubscribe: () => {
			redis.off("message", handler);
		}
	};
}

/**
 * allows to subscribe to gps data changes in GPS module
 * @param callback handler to execute when new gps data arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 */
function watchGPS(callback, errorCallback: Function) {
	try {
		redis.subscribe("gps");
		var cb = function (channel, gps) {
			if(channel !== "gps") return;
			callback(gps);
		};
		redis.on("message", cb);
		return {
			unsubscribe: () => {
				redis.off("message", cb);
			}
		};
	} catch (error) {
		if (errorCallback) errorCallback(error);
		else console.error(error);
	}
}

export default {
	getCurrentPosition,
	watchPosition,
	watchGPS
};
