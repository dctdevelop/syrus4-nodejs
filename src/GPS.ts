/**
 * GPS module get information about gps and location in ApexOS
 * @module GPS
 */
import { redisSubscriber as subscriber } from "./Redis";
import utils from "./Utils";
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
			satsActive: gps.satused,
			satsVisible: gps.satview,
			criteria: "signal"
		}
	};
}

function evaluateCriteria(current, last = null, config = { hdop: 3, distance: 0, time: 0, bearing: 0 }) {
	if (config.hdop > 0 && current.extras.hdop > config.hdop) {
		return false;
	}
	if (!last) return "signal";
	var criteria = config.distance == 0 && config.time == 0 && config.bearing == 0 ? "accuracy" : false;
	var distance = utils.distanceBetweenCoordinates(last, current) * 1000;
	var secs = Math.abs(new Date(current.timestamp).getTime() - new Date(last.timestamp).getTime()) / 1000;
	var bearing = Math.abs(last.coords.bearing - current.coords.bearing);
	if (config.distance > 0 && distance >= config.distance) criteria = "distance";
	if (config.time > 0 && secs >= config.time) criteria = "time";
	if (config.bearing > 0 && bearing >= config.bearing) criteria = "heading";
	return criteria;
}

/**
 * Get last current location from GPS
 */
function getCurrentPosition(config = { hdop: 0, distance: 0, time: 0, bearing: 0 }) {
	return new Promise(async (resolve, reject) => {
		try {
			var timeoutToTransmit;
			var handler = function (channel, gps) {
				if (channel != "gps") return;
				var position: any = rawdataToCoordinates(gps);
				if (!position.coords.latitude) return;
				var criteria = evaluateCriteria(position);
				if (!config || !!criteria) {
					subscriber.off("message", handler);
					position.extras.criteria = criteria;
					resolve(position);
					clearTimeout(timeoutToTransmit);
				}
			};
			subscriber.on("message", handler);
			if (config.time > 0) {
				clearTimeout(timeoutToTransmit);
			}
			subscriber.subscribe("gps");
			if (config.time > 0) {
				timeoutToTransmit = setTimeout(() => {
					subscriber.off("message", handler);
					resolve(rawdataToCoordinates("{}"));
				}, config.time);
			}
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
function watchPosition(callback: Function, errorCallback: Function, config = { hdop: 0, distance: 0, time: 0, bearing: 0 }) {
	var last_returned = null;
	var last_valid = rawdataToCoordinates("{}");
	var intervalToTransmit = null;
	var handler = function (channel, gps) {
		if (channel !== "gps") return;
		var position = rawdataToCoordinates(gps);
		if (!position.coords.latitude) return;
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
	subscriber.subscribe("gps");
	subscriber.on("message", handler);
	if (config.time > 0) {
		intervalToTransmit = setInterval(() => {
			callback(last_valid, "time");
		}, config.time);
	}
	return {
		unsubscribe: () => {
			clearInterval(intervalToTransmit);
			subscriber.off("message", handler);
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
		subscriber.subscribe("gps");
		var cb = function (channel, gps) {
			if (channel !== "gps") return;
			callback(gps);
		};
		subscriber.on("message", cb);
		return {
			unsubscribe: () => {
				subscriber.off("message", cb);
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
