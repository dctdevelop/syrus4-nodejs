/**
 * Accelerometer module get information about hardware acceleration and events in ApexOS
 * @module Accelerometer
 */
import * as Redis from "ioredis";
import redis_conf from "./redis_conf";
/**
 * Watch the motion state of the Syrus Apex accceleration hardware module
 * @param callback callback to executed when motion state changes
 * @param errorCallback callback to execute in case of error
 */
function onMotionChange(callback, errorCallback) {
    var redis = new Redis(redis_conf);
	try {
		var handler = raw => {
			var [eventType, isMoving] = raw.split(",");
			if (eventType == "MOTION") {
				callback(isMoving == "1");
			}
		};
		redis.subscribe("accel/events");
		redis.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	return {
		unsubscribe: () => {
			redis.off("message", handler);
			redis.unsubscribe("accel/events");
        },
        off: ()=>{
            redis.off("message", handler);
            redis.unsubscribe("accel/events");
        }
	};
}

/**
 * Watch for accelerations events in Apex OS. possible events:
 * FORWARD_COLLISION, BACKWARD_COLLISION, LAT_COLLISION_FROM_RIGHT, LAT_COLLISION_FROM_LEFT, HARSH_FWD_ACCELERATION, HARD_BRAKING, CORNERING_RIGHT, CORNERING_LEFT
 * @param callback callback to executed when new acceleration event received
 * @param errorCallback callback to execute in case of error
 */
function on(callback, errorCallback){
    var redis = new Redis(redis_conf);
	try {
		var handler = raw => {
            var [eventType, ...results] = raw.split(",");
            if(eventType != "MOTION") callback(eventType, results);
		};
		redis.subscribe("accel/events");
		redis.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	return {
		unsubscribe: () => {
			redis.off("message", handler);
			redis.unsubscribe("accel/events");
        },
        off: ()=>{
            redis.off("message", handler);
            redis.unsubscribe("accel/events");
        }
	};
}

/**
 * Set the state for the auto alignment procces of the APEX OS acceleration hardware
 * @param state desired state of auto alignment proccess
 */
function startAutoAlignment(state = true){
    var redis = new Redis(redis_conf);
    redis.hset("accel_desired_action", "START_ALIGN_PROCESS", state ? "1" : "0");
    redis.publish("accel/desired/action/START_ALIGN_PROCESS", state ? "1" : "0");
}

/**
 * Set the state for the self acceleration test of the APEX OS acceleration hardware
 * @param state desired state of self acceleration test proccess
 */
function startSelfAccelerationTest(state = true){
    var redis = new Redis(redis_conf);
    redis.hset("accel_desired_action", "START_SELF_ACCEL_TEST", state ? "1" : "0");
    redis.publish("accel/desired/action/START_SELF_ACCEL_TEST", state ? "1" : "0");
}


/**
 * enable or disable serial port debugger for acceleration hardware in APEX OS
 * @param state desired state of serial port debugger
 */
function setDebugMode(state = true){
    var redis = new Redis(redis_conf);
    redis.hset("accel_desired_action", "DEBUG_SERIAL_PORT", state ? "1" : "0");
    redis.publish("accel/desired/action/DEBUG_SERIAL_PORT", state ? "1" : "0");
}

/**
 * check is hardware is on state auto aligning returns a promise with the state
 */
async function isAutoAligning(){
    var redis = new Redis(redis_conf);
    var result = await redis.hget("accel_desired_action", "START_ALIGN_PROCESS");
    return result == "1";
}

/**
 * check is hardware is on state acceleration test returns a promise with the state
 */
async function isAccelerationTest(){
    var redis = new Redis(redis_conf);
    var result = await redis.hget("accel_desired_action", "START_SELF_ACCEL_TEST");
    return result == "1";
}

/**
 * check is hardware is on serial port debug mode returns a promise with the state
 */
async function isDebugMode(){
    var redis = new Redis(redis_conf);
    var result = await redis.hget("accel_desired_action", "DEBUG_SERIAL_PORT");
    return result == "1";
}

export default {
    onMotionChange,
    on,
    startAutoAlignment,
    startSelfAccelerationTest,
    setDebugMode,

    isAutoAligning,
    isAccelerationTest,
    isDebugMode
};
