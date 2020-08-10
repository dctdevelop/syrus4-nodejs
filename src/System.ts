import Utils from "./Utils";
import { redisSubscriber as subscriber, redisClient as redis } from "./Redis";

/**
 * System module get information about ApexOS
 * @module System-Info
 */

/**
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
	return Utils.OSExecute("apx-about");
}

async function modem() {
	var response = await redis.hgetall("modem_information");
	return response;
}

/**
 * hanlder to detect power save mode and execute callback 15 seconds before the device goes to sleep
 * @param callback callback to execute when power save mode is on and device is about to turn off
 * @param errorCallback callbac to execute in case of any error
 */
function onSleepOn(callback, errorCallback) {
	try {
		var handler = (channel, raw) => {
			if (channel !== "interface/notification/PSM_ACTIVATED") return;
			callback(raw);
		};
		subscriber.subscribe("interface/notification/PSM_ACTIVATED");
		subscriber.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	var returnable: any = {
		unsubscribe: () => {
			subscriber.off("message", handler);
		}
	};
	returnable.off = returnable.unsubscribe;
	return returnable;
}

/**
 * Get the latest wakeup reason and timestamp from sleep on from APEX OS
 */
async function getLastWakeUp() {
	var data = await redis.lrange("psm_events", 0, 5);
	if (data.length === 0) return false;
	for (const entry of data) {
		if (entry.indexOf("PSM_ACTIVATED,") == -1) {
			var parts = entry.split(",");
			var unix = parts.pop();
			return {
				wakeup_reason: parts[0],
				reasons: parts,
				timestamp: new Date(parseInt(unix) * 1000)
			};
		}
	}
	return false;
}

/**
 * Get the latest time from  sleep on event from APEX OS
 */
async function getlastSleepOn() {
	var data = await redis.lrange("psm_events", 0, 5);
	if (data.length === 0) return false;
	for (const entry of data) {
		if (entry.indexOf("PSM_ACTIVATED,") != -1) {
			var parts = entry.split(",");
			var unix = parts.pop();
			return {
				event: "wakeup",
				timestamp: new Date(parseInt(unix) * 1000)
			};
		}
	}

	return false;
}

/**
 * Get the list of latets sleep on and wakeup events with reason and timestamp
 */
async function getWakeUpList() {
	var list = [];
	var data = await redis.lrange("psm_events", 0, 5);
	if (data.length === 0) return [];
	for (const entry of data) {
		if (entry.indexOf("PSM_ACTIVATED,") == -1) {
			let parts = entry.split(",");
			let unix = parts.pop();
			list.push({
				wakeup_reason: parts[0],
				reasons: parts,
				timestamp: new Date(parseInt(unix) * 1000),
				event: "wakeup"
			});
		} else {
			let parts = entry.split(",");
			let unix = parts.pop();
			list.push({
				timestamp: new Date(parseInt(unix) * 1000),
				event: "sleep"
			});
		}
	}

	return list;
}

var defined = false
var handlers = [];
/**
 * add a callback from stack to execute when app signal termination
 * @param callback  callback to execute when application goes offline
 */
function addDisconnectListener(callback) {
	if(!defined){
		process.stdin.resume(); //so the program will not close instantly
		function exitHandler(options, exitCode) {
			// console.log(options, exitCode);
			for (const handler of handlers) {
				try {
					handler(exitCode);
				} catch (error) {
					console.error(error);
				}
			}
			if (options.exit) process.exit(exitCode);
		}
		//do something when app is closing
		process.on("exit", exitHandler.bind(null, { cleanup: true }));
		//catches ctrl+c event
		process.on("SIGINT", exitHandler.bind(null, { exit: true }));
		// catches "kill pid" (for example: nodemon restart)
		process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
		process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
		//catches uncaught exceptions
		process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
		defined = true
	}
}

/**
 * remove a callback from stack to execute when app signal termination
 * @param callback callback to remove from listener
 */
function removeDisconnectListener(callback){
	let index = handlers.findIndex((h)=> h == callback);
	if(index > -1)
		handlers.splice(index, 1);
	else
		throw "Handler callback never added";
}

export default { info, modem, onSleepOn, getLastWakeUp, getlastSleepOn, getWakeUpList , addDisconnectListener ,removeDisconnectListener };
