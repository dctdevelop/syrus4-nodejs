/**
 * IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
 * TODO: implement this
 * @module IOS
 */
import * as Redis from "ioredis";
var redis = new Redis();
var notis = new Redis();
const SUBSCRIBE_CHANNEL = "io/input";

/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName = "IGN", cb, errorCallback?: Function) {
	var callback = function(_pattern, channel, raw) {
		var input = channel.split("/")[2];
		if (input == inputName) {
			var returnable = raw;
			if (raw == "true") returnable = true;
			if (raw == "false") returnable = false;
			cb(returnable);
		}
	};
	var channel = `${SUBSCRIBE_CHANNEL}/${inputName}`;
	console.log("channel-name:", channel);
	notis.psubscribe(channel);
	notis.on("pmessage", callback);

	return {
		unsubscribe: () => {
			notis.off(`${SUBSCRIBE_CHANNEL}/${inputName}`, callback);
			notis.unsubscribe(`${SUBSCRIBE_CHANNEL}/${inputName}`);
		}
	};
}
/**
 * get a promise that resolve the current input or output state
 * @param inputName the input/output requested
 */
function getInputState(inputName = "OUT1"): Promise<any> {
	return new Promise(async (resolve, reject) => {
		var response = await redis.hget("current_output_state", inputName);
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
		resolve(state);
	});
}

export default {
	watchInputState,
	getInputState,
	setOutputState
};
