/**
 * Serial module, get information about serial state
 * @module Serial
 */

import { SystemRedisSubscriber as subscriber } from "./Redis";
// import * as Utils from "./Utils"

export async function onBluetoothUpdate(
	callback: (channel:string, payload: any) => void,
	errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {
	const topic = "bluetooth/notification/*"
	try {
		var handler = (pattern:string, channel: string, data: any) => {
			if (!channel.startsWith('bluetooth/notification')) return
			callback(channel, JSON.parse(data))
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

export async function onAppConsoleMessage(
	callback: (arg: any) => void,
	errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {
	const topic = "bluetooth/messages/user_apps_console"
	// const topic = "bluetooth/user_apps_console/MESSAGE"
	// subscribe to receive updates
	try {
		var handler = (channel: string, data: any) => {
			if (channel != topic) return
			callback(data)
		};
		subscriber.subscribe(topic);
		subscriber.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}
	let returnable = {
		unsubscribe: () => {
			subscriber.off("message", handler);
			subscriber.unsubscribe(topic);
		},
		off: function () { this.unsubscribe() }
	};
	return returnable;
}
