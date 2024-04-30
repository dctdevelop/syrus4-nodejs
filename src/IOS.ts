/**
 * IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
 * @module IOS
 */
import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

type Inputs = "MOT" | "IGN" | "IN1" | "IN2" | "IN3" | "IN4" | "IN5" | "IN6" | "IN7" | "PWR" | "SO1" | "SO2" | "SO3" | "SO4" | "TIG";
type Outputs = "OUT1" | "OUT2" | "OUT3" | "OUT4";
type Analogs = "AN1" | "AN2" | "AN3" | "AN4";
type AllInputs = "*" | Inputs | Outputs | Analogs;

/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName: AllInputs = "*", cb: (response: any) => void, errorCallback?: Function) {
	let chn = `interface/input/${inputName}`
	if (inputName == "*") {
		chn = `interface/*`
	} else if (inputName[0] == "O") {
		chn = `interface/output/${inputName}`
	} else if (inputName[0] == "A") {
		chn = `interface/analog/${inputName}`
	}
	
	let callback = function (pattern: string, channel: string, raw: string) {
		if (pattern != chn) return
		if (channel.includes('/desired')) return
		let input = channel.split("/")[2]
		if (inputName == "*" || input == inputName) {
			let returnable : string|boolean = raw
			if (raw == "true") returnable = true
			if (raw == "false") returnable = false
			let response = {}
			response[input] = returnable
			cb(response)
		}
	}
	subscriber.psubscribe(chn)
	subscriber.on("pmessage", callback)
	return {
		unsubscribe: () => {
			subscriber.off("pmessage", callback)
		}
	}
}

/**
 * get a promise that resolve the current input or output state
 * @param inputName the input/output requested
 */
async function getInputState(inputName: AllInputs = "IGN"): Promise<any> {
	var response = await Utils.OSExecute(`apx-io get ${inputName}`);
	return response == "true";
}

/**
 * Allow to change the state of an output
 * @param inputName the output to change state
 * @param state the new state  of the output
 */
async function setOutputState(inputName: Outputs = "OUT1", state = true): Promise<any> {
	await Utils.OSExecute(`apx-io set ${inputName} ${state}`);
	return `${state}` == "true";
}

/**
 * Get the current state of all inputs, outputs and analogs in the Syrus4 device
 */
async function getAll() {
	let [inputs, ierr] = await Utils.$to(Utils.OSExecute(`apx-io getall inputs`))
	let [outputs, oerr] = await Utils.$to(Utils.OSExecute(`apx-io getall outputs`))
	let [analogs, anerror] = await Utils.$to(Utils.OSExecute(`apx-io getall analogs`))
	if(ierr){
		inputs = {}
		console.error(ierr)
	}
	if (oerr) {
		outputs = {}
		console.error(oerr)
	}
	if (anerror) {
		analogs = {}
		console.error(anerror)
	}
	return { ...inputs, ...outputs, ...analogs }
}

export default {
	watchInputState,
	getInputState,
	setOutputState,
	getAll
};
