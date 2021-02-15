/**
 * ECU module get information about EcU monitor and vehicle in ApexOS
 * @module ECU
 */
import { params } from 'tag-params';

import * as Utils from "./Utils"
import { SystemRedisSubscriber as subscriber, SystemRedisClient as redis } from "./Redis";
import * as ECU_PARAM_LIST from "./ECU_fields.json";
/**
 * ECU PARAM LIST from the ecu monitor
 */

export async function getECUInfo() {
	var resp: any = await Utils.OSExecute(`apx-ecu configure`);
	var resp2: any = await redis.hgetall(`ecumonitor_current_state`);
	return {
		primary_can: resp.PRIMARY_CAN,
		secondary_can: resp.SECONDARY_CAN,
		J1708: resp.J1708,
		listen_only_mode: resp.LISTEN_ONLY_MODE,
		version: resp2.ECUMONITOR_VERSION
	};
}

function template(strings: string[], ...keys: string[]): string {
	let result = [strings[0]]
	keys.forEach((key, i) => {
		result.push(key, strings[i + 1])
	})
	return result.join('')
}

/**
 *  allows to subscribe for ECU parameter changes
 * @param cb calbback to execute when new ECU data arrives
 * @param errorCallback errorCallback when something wrong goes with the subscription
 */
export function watchECUParams(cb: Function, errorCallback: Function) {
	try {
		var handler = (channel:string, raw:string) => {
			if (channel != "ecumonitor/parameters") return;
			const ecu_values = {};
			raw.split("&").map(param => {
				const [ key, value ] = param.split("=");
				const element = ECU_PARAM_LIST[key] || {}
				const {
					syruslang_param, syruslang_prefix, syruslang_suffix,
					tokenizer, itemizer
				} = element
				// save values directly, even if broken down
				let fvalue = isNaN(Number(value)) ? value : Number(value);
				if (syruslang_param) {
					ecu_values[syruslang_param] = fvalue
				}
				ecu_values[key] = fvalue
				if (!(tokenizer || itemizer)) return
				if (!value.includes(tokenizer)) return

				let tokens: string[];
				let regex = /(?<value>.*)/
				if (itemizer){
					regex = new RegExp(itemizer)
				}
				tokens = [ value ]
				if (tokenizer) {
					tokens = value.split(tokenizer)
				}
				for (const token of tokens){
					try{
						let skey = syruslang_param
						let { groups } = regex.exec(token)
						let tags: [string[], ...string[]];
						if (syruslang_prefix) {
							tags = params(syruslang_prefix, groups)
							skey = `${template(...tags)}.${skey}`
						}
						if (syruslang_suffix) {
							tags = params(syruslang_suffix, groups)
							skey = `${skey}.${template(...tags)}`
						}
						let svalue = isNaN(Number(groups.value)) ? groups.value : Number(groups.value)
						ecu_values[skey] = svalue
					} catch(error){
						console.error({error, key, token, regex})
					}
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

	const returnable: any = {
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
export async function getECUParams() {
	const ecu_params: any = await Utils.OSExecute("apx-ecu list_parameters");
	const ecu_values: any = {};
	for (const key in ecu_params) {
		const value = ecu_params[key];
		ecu_values[`${key}`] = isNaN(Number(value)) ? value : Number(value);
	}
	return ecu_values;
}

/**
 * get ecu paramas list associated to all the pgn and id for ecu and taip tag associated
 */
export function getECUList() {
	return ECU_PARAM_LIST;
}

export default { ECU_PARAM_LIST, getECUParams, getECUList, watchECUParams, getECUInfo };
