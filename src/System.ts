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
function onSleepOn(callback, errorCallback){
    try {
		var handler = (channel, raw) => {
			if(channel !== "interface/notification/PSM" && channel !== "interface/notification/PSM_ACTIVATED") return;
			callback(raw);
		};
		subscriber.subscribe("interface/notification/PSM");
		subscriber.subscribe("interface/notification/PSM_ACTIVATED");
		subscriber.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
    }

    var returnable:any = {
		unsubscribe: () => {
			subscriber.off("message", handler);
		}
	};
	returnable.off = returnable.unsubscribe;
	return returnable
}

// async function getSleepOffReason(){
//     var data = await redis.hgetall("current_interface_information");
//     data["SOC_RST_REASON"]
// }


export default { info, modem, onSleepOn };
