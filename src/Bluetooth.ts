/**
 * Serial module, get information about serial state
 * @module Serial
 */

import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

export async function onBTDoubleTap(
	callback: (arg: any) => void,
	errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {
	const topic = "bluetooth/notification/CALL_BUTTON"
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
