/**
 * Counters module setup get and set counters from APEX OS
 * @module Counters
 */
import * as Utils from "./Utils"

async function exists(name:string) {
	var counters = await Utils.OSExecute(`apx-counter list`);
	return !!counters[`${name}`] || !!counters[`counter_${name}`];
}

const COUNTER_KEYS = [
	"odometer", "ignition_time", "idle_time",
	"over_speed", "over_rpm", "hard_brakes",
	"harsh_fwd_acceleration", "rpm_threshold",
	"speed_threshold", "begin_idle_time", "distance"
]
async function startCounters(config:any) {
	const name = config.name
	if (!name) throw "name is required"
	const shouldSet = config.forceSet || !(await exists(name))
	await Utils.OSExecute(`apx-counter start ${name}`)
	if (!shouldSet) return
	for (const key of COUNTER_KEYS) {
		if (config[key] == undefined) continue
		console.log('SDK setCounter:', `apx-counter set ${name} ${key.toUpperCase()} ${config[key]}`);
		Utils.OSExecute(`apx-counter set ${name} ${key.toUpperCase()} ${config[key]}`)
	}
}

async function getCounters(name:string) {
	if (!name) throw "name is required";
	return await Utils.OSExecute(`apx-counter getall ${name}`);
}

async function watchCounters(name, cb, cbError, interval=15){
	if(!name) throw "name is required";
	if(!(await exists(name))) throw "counter does not exists";
	try {
		var intervalHandler = setInterval(async ()=>{
			var results = (await getCounters(name));
			cb(results);
		}, interval * 1000);
	} catch (error) {
		cbError(error);
	}

	return {
		off(){
			clearInterval(intervalHandler);
		},
		unsubscribe(){
			clearInterval(intervalHandler);
		}
	};
}

async function stopCounters(name:string) {
	if (!name) throw "name is required";
	await Utils.OSExecute(`apx-counter stop ${name}`);
}

async function resetCounters(name:string) {
	if (!name) throw "name is required";
	await Utils.OSExecute(`apx-counter reset ${name}`);
}

async function deleteCounters(name:string) {
	if (!name) throw "name is required";
	await Utils.OSExecute(`apx-counter delete ${name}`);
}

async function listCounters() {
	var _counters:any = await Utils.OSExecute(`apx-counter list`);
	var counters = {};
	for (const key in _counters) {
			counters[`${key.replace("counter_","")}`];
	}
	return counters;
}

async function setCounter(name:string = "globals", key:string = undefined, value:number = undefined) {
	if (name == undefined) throw "Counter name is required"
	if (key == undefined) throw "Counter key is required"
	if (value == undefined) throw "Counter value is required"

	if (COUNTER_KEYS.includes(key)) {
		await Utils.OSExecute(`apx-counter set ${name} ${key.toUpperCase()} ${value}`);
	}
}

export default { startCounters, stopCounters, resetCounters, watchCounters, listCounters, deleteCounters , setCounter};
