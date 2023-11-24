/**
 * Accelerometer module get information about hardware acceleration and events in ApexOS
 * @module Accelerometer
 */
import { SystemRedisSubscriber as subscriber, SystemRedisClient as redis } from "./Redis";
import * as Utils from "./Utils"
import _isObjectLike from 'lodash.isobjectlike'
/**
 * Watch the motion state of the Syrus Apex accceleration hardware module
 * @param callback callback to executed when motion state changes
 * @param errorCallback callback to execute in case of error
 */
function onMotionChange(callback, errorCallback) {
	try {
		var handler = (channel, raw) => {
			if(channel != "accel/events") return;
			var [eventType, isMoving] = raw.split(",");
			if (eventType == "MOTION") {
				callback(isMoving == "1");
			}
		};
		subscriber.subscribe("accel/events");
		subscriber.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	var returnable:any = {
		unsubscribe: () => {
			subscriber.off("message", handler);
			subscriber.unsubscribe("accel/events");
		}
	};
	returnable.off = returnable.unsubscribe;
	return returnable;
}

/**
 * Watch for accelerations events in Apex OS. possible events:
 * FORWARD_COLLISION, BACKWARD_COLLISION, LAT_COLLISION_FROM_RIGHT, LAT_COLLISION_FROM_LEFT, HARSH_FWD_ACCELERATION, HARD_BRAKING, CORNERING_RIGHT, CORNERING_LEFT
 * @param callback callback to executed when new acceleration event received
 * @param errorCallback callback to execute in case of error
 */
function on(callback, errorCallback) {
	try {
		var handler = (channel, raw) => {
            if(channel != "accel/events") return;
			var [eventType, ...results] = raw.split(",");
			if (eventType != "MOTION") callback(eventType.toLowerCase(), results);
		};
		subscriber.subscribe("accel/events");
		subscriber.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	var returnable:any = {
		unsubscribe: () => {
			subscriber.off("message", handler);
			subscriber.unsubscribe("accel/events");
		}
    };
    returnable.off = returnable.unsubscribe;
    return returnable;
}

/**
 * Set the state for the auto alignment procces of the APEX OS acceleration hardware
 * @param state desired state of auto alignment proccess
 */
function startAutoAlignment(state = true) {
	return Utils.OSExecute(`apx-imu self_alignment ${state ? 1 : 0}`);
}

/**
 * Set the state for the self acceleration test of the APEX OS acceleration hardware
 * @param state desired state of self acceleration test proccess
 */
function startSelfAccelerationTest(state = true) {
	return Utils.OSExecute(`apx-imu self_test ${state ? 1 : 0}`);
}

/**
 * check is hardware is on state auto aligning returns a promise with the state
 */
async function isAutoAligning() {
	return Utils.OSExecute("apx-imu self_alignment");
}

/**
 * check is hardware is on state acceleration test returns a promise with the state
 */
async function isAccelerationTest() {
	return Utils.OSExecute("apx-imu self_test");
}

/**
 * Check the current state of the acceloremeter hardware is moving
 */
async function isMoving() {
	var result = await redis.hget("accel_current_state", "MOTION");
	return result == "1";
}

async function onAccelUpdate(
	callback: (payload: any) => void,
	errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {

	const topic = "accel/report"

	try {
		var handler = (channel: string, data: any) => {
			if (!channel.startsWith('accel/report')) return
			try {
				const state = JSON.parse(data)
				if (!_isObjectLike(state)) throw 'not objectLike'
				callback(state)
			} catch (error) {
				console.log('onAccelUpdate error:', error)
			}
		};
		subscriber.subscribe(topic);
		subscriber.on("message", handler);
	} catch (error) {
		console.log("onAccelUpdate error:", error );
		errorCallback(error);
	}

	return {
		unsubscribe: () => {
		subscriber.off("message", handler);
		subscriber.unsubscribe(topic);  
		},
		off: () => {
			this.unsubscribe();
		}
	}

}

export default {
	isMoving,
	onMotionChange,
	on,
	startAutoAlignment,
	startSelfAccelerationTest,
	isAutoAligning,
	isAccelerationTest,
	onAccelUpdate
};
