/**
 * ECU module get information about EcU monitor and vehicle in ApexOS
 * @module ECU
 */
import { redisSubscriber as subscriber, redisClient as redis } from "./Redis";
import * as ECU_PARAM_LIST from "./ECU.json";
/**
 * ECU PARAM LIST from the ecu monitor
 */

async function getECUInfo() {
	var resp: any = await redis.hgetall(`ecumonitor_configuration`);
	var resp2: any = await redis.hgetall(`ecumonitor_current_state`);

	return {
		primary_can: resp.PRIMARY_CAN,
		secondary_can: resp.SECONDARY_CAN,
		J1708: resp.J1708,
		listen_only_mode: resp.LISTEN_ONLY_MODE,
		version: resp2.ECUMONITOR_VERSION
	};
}

/**
 *  allows to subscribe for ECU parameter changes
 * @param cb calbback to execute when new ECU data arrives
 * @param errorCallback errorCallback when something wrong goes with the subscription
 */
function watchECUParams(cb: Function, errorCallback: Function) {
	try {
		var handler = (channel, raw) => {
			if (channel != "ecumonitor/parameters") return;
			var ecu_values: any = {};
			raw.split("&").map(param => {
				var [key, value] = param.split("=");
				if (ECU_PARAM_LIST[`${key}`]) {
					ecu_values[ECU_PARAM_LIST[key].syruslang_param] = isNaN(parseFloat(value)) ? value : parseFloat(value);
				} else {
					ecu_values[`${key}`] = isNaN(parseFloat(value)) ? value : parseFloat(value);
				}
			});
			cb(ecu_values);
		};
		subscriber.subscribe("ecumonitor/parameters");
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
 * Get all the most recent data from ECU parameters
 */
async function getECUParams() {
	var ecu_params = await redis.hgetall("ecumonitor_parameters");
	var ecu_values: any = {};
	for (const key in ecu_params) {
		const value = ecu_params[key];
		ecu_values[`${key}`] = isNaN(parseFloat(value)) ? value : parseFloat(value);
	}
	return ecu_values;
}

/**
 * get ecu paramas list associated to all the pgn and id for ecu and taip tag associated
 */
function getECUList() {
	return ECU_PARAM_LIST;
}

export default { ECU_PARAM_LIST, getECUParams, getECUList, watchECUParams, getECUInfo };
