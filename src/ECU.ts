/**
 * ECU module get information about EcU monitor and vehicle in ApexOS
 * @module ECU
 */

import * as fs from "fs"
import * as path from "path"
import { params } from 'tag-params';

import * as Utils from "./Utils"
import { SystemRedisSubscriber as subscriber, SystemRedisClient as redis } from "./Redis";
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
	let ECU_PARAM_LIST = getECUList()
	const errors_cache = {}
	const error_pgn = "feca_3-6"
	try {
		var handler = async (channel:string, raw:string) => {
			if (channel != "ecumonitor/parameters") return
			const ecu_values = {}
			raw.split("&").map(param => {
				const [ key, value ] = param.split("=");
				const element = ECU_PARAM_LIST[key] || {}
				const {
					$name, $tokenizer,
					$itemizer, $item_name,
					$signals
				} = element
				// save values directly, even if broken down
				let fvalue = isNaN(Number(value)) ? value : Number(value);
				if ($name) {
					ecu_values[$name] = fvalue
				}
				if (fvalue && Array.isArray($signals)) {
					$signals.map((signal) => ecu_values[`@${signal}`] = true)
				}
				ecu_values[key] = fvalue
				if (!($tokenizer || $itemizer)) return
				if (!value.includes($tokenizer)) return

				let tokens: string[]
				let regex = /(?<value>.*)/
				if ($itemizer){
					regex = new RegExp($itemizer)
				}
				tokens = [ value ]
				if ($tokenizer) {
					tokens = value.split($tokenizer)
				}
				for (const token of tokens){
					try{
						let skey = $name
						let { groups } = regex.exec(token)
						let tags: [string[], ...string[]]
						if ($item_name) {
							tags = params($item_name, groups)
							skey = `${template(...tags)}`
						}
						let svalue = isNaN(Number(groups.value)) ? groups.value : Number(groups.value)
						ecu_values[skey] = svalue
					} catch(error){
						console.error({error, key, token, regex})
					}
				}
			});
			// handle error codes
			const encoded_error = ecu_values[error_pgn]
			if (encoded_error){
				let error_codes = { spn: 0, fmi: 0, cm: 0, oc: 0 }
				let cached = errors_cache[encoded_error]
				if (!cached) {
					let [decoded, decoded_error] = await Utils.$to(
						Utils.OSExecute(`apx-ecu decode --unique_id=${error_pgn} --value=${encoded_error}`)
					)
					if (decoded_error) console.error(decoded_error)
					if (decoded) {
						cached = errors_cache[encoded_error] = decoded
					}
				}
				error_codes = {...error_codes, ...cached}
				ecu_values['error_codes'] = error_codes
			}
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

let __ecu_loaded = false
let __ecu_params = {}
/**
 * get ecu paramas list associated to all the pgn and id for ecu and taip tag associated
 */
export function getECUList(reload: boolean = false) {
	if (reload) {
		__ecu_loaded = false
		__ecu_params = {}
	}
	if (__ecu_loaded) return __ecu_params
	let ecu_paths = [
		// '/home/syrus4g/ecumonitor/definitions',
		path.join(__dirname, '../ECU.d'),
	]
	let filenames = []
	ecu_paths.map((ecu_path)=>{
		if(!fs.existsSync(ecu_path)) return
		fs.readdirSync(ecu_path).map((filename)=>{
			if (filename.startsWith('_') || !filename.endsWith('.json')) return
			filenames.push(filename)
			try {
				let data = require(path.join(ecu_path, filename))
				__ecu_params = { ...__ecu_params, ...data }
			}catch(error){
				console.error(error)
			}
		})
	})
	console.log("ECU loaded\n", filenames.join(","))
	__ecu_loaded = true
	return JSON.parse(JSON.stringify(__ecu_params))
}

export default { getECUParams, getECUList, watchECUParams, getECUInfo };
