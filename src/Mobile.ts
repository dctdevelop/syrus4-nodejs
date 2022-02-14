import * as Utils from "./Utils"
import { SystemRedisSubscriber as subscriber } from "./Redis";
import System from "./System";

type Parameter = "apn" | "user" | "pin" | "pass";

/**
 * Mobile module to interacte with the Mobile Network allow to get/set modem parameters
 * @module Mobile
 */

export interface ModemEvent {
	GSM_REG: number,
	GPRS_REG: number,
	RAT: string,
	MCC_MNC: number,
	BAND: string,
	OPERATOR: string,
	SIM_STATE: string,
	eSIM_STATE: string,
	IP: string,
	LAC: string,
	CID: string,
	RSSI: number,
	VOICE_CALL: {
		phone: string,
		state: string,
	},
	SMS_RX: {
		msg: string,
		sender: string,
		date: string,
	},
}

/**
 * returns a JSON with the configured values in RF
 */
export function getInfo() {
	return Utils.OSExecute("apx-mdm state");
}

/**
 * Use this option to configure the network variable for mobile networks
 * @param key the paramter to be configured, posible values are: "apn", "user", "pin", "pass"
 * @param value the new value of the parameter
 */
export function set(key: Parameter, value:string) {
	if (key == "pin" && value.length != 4) {
		return new Promise((_resolve, reject) => {
			reject("Pin must be exaclty four characters");
		});
	}
	return Utils.OSExecute("apx-mdm", key, value);
}

export async function onModemChange(
	callback: (arg: ModemEvent) => void,
	errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {
	const topic = "modem/notification/*"
	// subscribe to receive updates
	try {
		var state: ModemEvent | any = await System.modem()
		var handler = (pattern:string, channel: string, data: any) => {
			if (pattern != topic) return
			let key = channel.split('/')[2]
			if('VOICE_CALL,SMS_RX'.includes(key)) data = JSON.parse(data)
			state[key] = data
			callback(state)
		};
		subscriber.on("pmessage", handler);
		subscriber.psubscribe(topic);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}
	let returnable = {
		unsubscribe: () => {
			subscriber.off("pmessage", handler);
			subscriber.punsubscribe(topic);
		},
		off: function () { this.unsubscribe() }
	};
	return returnable;
}
