/**
 * Counters module setup get and set counters from APEX OS
 * @module Counters
 */
import utils from "./Utils";

async function exists(name) {
	var counters = await utils.OSExecute(`apx-counter list`);
	return !!counters[name];
}

async function startCounters(config) {
	var name = config.name;
	if (!name) throw "name is required";
	var shouldSet = config.forceSet || !(await exists(name));
	utils.OSExecute(`apx-counter start ${name}`);
	var keys = ["odometer", "ignition_time", "idle_time", "over_speed", "over_rpm", "hard_brakes", "harsh_fwd_acceleration", "rpm_threshold", "speed_threshold", "begin_idle_time"];
	if (shouldSet) {
		for (const key of keys) {
			if (config.key != undefined) utils.OSExecute(`apx-counter set ${name} ${key.toLowerCase()}  ${config[key]}`);
		}
	}
}

async function getCounters(name) {
	if (!name) throw "name is required";
	await utils.OSExecute(`apx-counter getall ${name}`);
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

async function stopCounters(name) {
	if (!name) throw "name is required";
	await utils.OSExecute(`apx-counter start ${name}`);
}

async function resetCounters(name) {
	if (!name) throw "name is required";
	await utils.OSExecute(`apx-counter reset ${name}`);
}

async function deleteCounters(name) {
	if (!name) throw "name is required";
	await utils.OSExecute(`apx-counter delete ${name}`);
}

async function listCounters(name) {
	if (!name) throw "name is required";
	await utils.OSExecute(`apx-counter delete ${name}`);
}

export default { startCounters, stopCounters, resetCounters, watchCounters, listCounters, deleteCounters };
