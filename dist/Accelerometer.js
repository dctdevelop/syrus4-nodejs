"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Accelerometer module get information about hardware acceleration and events in ApexOS
 * @module Accelerometer
 */
const Redis_1 = require("./Redis");
const Utils_1 = require("./Utils");
/**
 * Watch the motion state of the Syrus Apex accceleration hardware module
 * @param callback callback to executed when motion state changes
 * @param errorCallback callback to execute in case of error
 */
function onMotionChange(callback, errorCallback) {
    try {
        var handler = (channel, raw) => {
            if (channel != "accel/events")
                return;
            var [eventType, isMoving] = raw.split(",");
            if (eventType == "MOTION") {
                callback(isMoving == "1");
            }
        };
        Redis_1.SystemRedisSubscriber.subscribe("accel/events");
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    var returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe("accel/events");
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
            if (channel != "accel/events")
                return;
            var [eventType, ...results] = raw.split(",");
            if (eventType != "MOTION")
                callback(eventType.toLowerCase(), results);
        };
        Redis_1.SystemRedisSubscriber.subscribe("accel/events");
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    var returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe("accel/events");
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
    return Utils_1.default.OSExecute(`apx-imu self_alignment ${state ? 1 : 0}`);
}
/**
 * Set the state for the self acceleration test of the APEX OS acceleration hardware
 * @param state desired state of self acceleration test proccess
 */
function startSelfAccelerationTest(state = true) {
    return Utils_1.default.OSExecute(`apx-imu self_test ${state ? 1 : 0}`);
}
/**
 * check is hardware is on state auto aligning returns a promise with the state
 */
function isAutoAligning() {
    return __awaiter(this, void 0, void 0, function* () {
        return Utils_1.default.OSExecute("apx-imu self_alignment");
    });
}
/**
 * check is hardware is on state acceleration test returns a promise with the state
 */
function isAccelerationTest() {
    return __awaiter(this, void 0, void 0, function* () {
        return Utils_1.default.OSExecute("apx-imu self_test");
    });
}
/**
 * Check the current state of the acceloremeter hardware is moving
 */
function isMoving() {
    return __awaiter(this, void 0, void 0, function* () {
        var result = yield Redis_1.SystemRedisClient.hget("accel_current_state", "MOTION");
        return result == "1";
    });
}
exports.default = {
    isMoving,
    onMotionChange,
    on,
    startAutoAlignment,
    startSelfAccelerationTest,
    isAutoAligning,
    isAccelerationTest,
};
