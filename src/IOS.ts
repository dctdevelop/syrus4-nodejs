/**
 * IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
 * @module IOS
 */
import {redisSubscriber as subscriber, redisClient as redis } from "./Redis";

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
	var callback = function(pattern, _channel, raw) {
		if(pattern != chn) return;
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
function getInputState(inputName = "IGN"): Promise<any> {
	var channel = "current_input_state";
	if (inputName[0] == "O") {
		channel = "current_output_state";
	}
	if (inputName[0] == "A") {
		channel = "current_analog_state";
	}
	return new Promise(async (resolve, reject) => {
		var response = await redis.hget(channel, inputName);
		var returnable: any = response;
		if (response == "true") returnable = true;
		if (response == "false") returnable = false;
		resolve(returnable);
	});
}
/**
 * Allow to change the state of an output
 * @param inputName the output to change state
 * @param state the new state  of the output
 */
function setOutputState(inputName = "OUT1", state = true): Promise<boolean | number> {
	return new Promise((resolve, reject) => {
		redis.hset("desired_output_state", inputName, `${state}`);
		redis.publish(`desired/interface/output/${inputName}`, `${state}`, console.error);
		resolve(state);
	});
}

/**
 * Get the current state of all inputs, outputs and analogs in the Syrus4 device
 */
async function getAll() {
	var inputs = (await redis.hgetall("current_input_state")) || {};
	var outputs = (await redis.hgetall("current_output_state")) || {};
	var analogs = (await redis.hgetall("current_analog_state")) || {};
	var response = Object.assign(inputs, outputs);
	response = Object.assign(response, analogs);
	Object.keys(response).forEach(key => {
		if (response[key] == "true") response[key] = true;
		if (response[key] == "false") response[key] = false;
		if (parseFloat(response[key])) response[key] = parseFloat(response[key]);
	});
	return response;
}

export default {
	watchInputState,
	getInputState,
	setOutputState,
	getAll
};
