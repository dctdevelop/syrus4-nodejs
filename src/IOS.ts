/**
 * IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
 * @module IOS
 */
import { redisSubscriber as subscriber } from "./Redis";
import Utils from "./Utils";

/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName = "*", cb: (response: any) => void, errorCallback?: Function) {
	var chn = `interface/input/${inputName}`;
	if (inputName == "*") {
		chn = `interface/*`;
	} else if (inputName[0] == "O") {
		chn = `interface/output/${inputName}`;
	} else if (inputName[0] == "A") {
		chn = `interface/analog/${inputName}`;
	}
	var callback = function (pattern, _channel, raw) {
		if (pattern != chn) return;
		var input = _channel.split("/")[2];
		if (inputName == "*" || input == inputName) {
			var returnable = raw;
			if (raw == "true") returnable = true;
			if (raw == "false") returnable = false;
			var response = {};
			response[input] = returnable;
			cb(response);
		}
	};
	subscriber.psubscribe(chn);
	subscriber.on("pmessage", callback);

	return {
		unsubscribe: () => {
			subscriber.off("pmessage", callback);
		}
	};
}

/**
 * get a promise that resolve the current input or output state
 * @param inputName the input/output requested
 */
async function getInputState(inputName = "IGN"): Promise<any> {
	var response = await Utils.OSExecute(`apx-io get ${inputName}`);
	return response == "true";
}
/**
 * Allow to change the state of an output
 * @param inputName the output to change state
 * @param state the new state  of the output
 */
async function setOutputState(inputName = "OUT1", state = true): Promise<any> {
	await Utils.OSExecute(`apx-io set ${inputName} ${state}`);
	return `${state}` == "true";
}

/**
 * Get the current state of all inputs, outputs and analogs in the Syrus4 device
 */
async function getAll() {
	var response = {};

	var key = null;
	var text: any = await Utils.OSExecute(`apx-io getall inputs`);
	text = text.split("\n");
	for (const val of text) {
		if (!key) {
			key = val;
		} else {
			response[key] = val == "true";
			key = null;
		}
	}

	key = null;
	text = await Utils.OSExecute(`apx-io getall outputs`);
	text = text.split("\n");
	for (const val of text) {
		if (!key) {
			key = val;
		} else {
			response[key] = val == "true";
			key = null;
		}
	}

	key = null;
	text = await Utils.OSExecute(`apx-io getall analogs`);
	text = text.split("\n");
	for (const val of text) {
		if (!key) {
			key = val;
		} else {
			response[key] = parseFloat(val);
			key = null;
		}
	}

	return response;
}

export default {
	watchInputState,
	getInputState,
	setOutputState,
	getAll
};
