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
const Redis = require("ioredis");
const redis_conf_1 = require("./redis_conf");
/**
 * Watch the motion state of the Syrus Apex accceleration hardware module
 * @param callback callback to executed when motion state changes
 * @param errorCallback callback to execute in case of error
 */
function onMotionChange(callback, errorCallback) {
    var redis = new Redis(redis_conf_1.default);
    try {
        var handler = raw => {
            var [eventType, isMoving] = raw.split(",");
            if (eventType == "MOTION") {
                callback(isMoving == "1");
            }
        };
        redis.subscribe("accel/events");
        redis.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    return {
        unsubscribe: () => {
            redis.off("message", handler);
            redis.unsubscribe("accel/events");
        },
        off: () => {
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
function on(callback, errorCallback) {
    var redis = new Redis(redis_conf_1.default);
    try {
        var handler = raw => {
            var [eventType, ...results] = raw.split(",");
            if (eventType != "MOTION")
                callback(eventType, results);
        };
        redis.subscribe("accel/events");
        redis.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    return {
        unsubscribe: () => {
            redis.off("message", handler);
            redis.unsubscribe("accel/events");
        },
        off: () => {
            redis.off("message", handler);
            redis.unsubscribe("accel/events");
        }
    };
}
/**
 * Set the state for the auto alignment procces of the APEX OS acceleration hardware
 * @param state desired state of auto alignment proccess
 */
function startAutoAlignment(state = true) {
    var redis = new Redis(redis_conf_1.default);
    redis.hset("accel_desired_action", "START_ALIGN_PROCESS", state ? "1" : "0");
    redis.publish("accel/desired/action/START_ALIGN_PROCESS", state ? "1" : "0");
}
/**
 * Set the state for the self acceleration test of the APEX OS acceleration hardware
 * @param state desired state of self acceleration test proccess
 */
function startSelfAccelerationTest(state = true) {
    var redis = new Redis(redis_conf_1.default);
    redis.hset("accel_desired_action", "START_SELF_ACCEL_TEST", state ? "1" : "0");
    redis.publish("accel/desired/action/START_SELF_ACCEL_TEST", state ? "1" : "0");
}
/**
 * enable or disable serial port debugger for acceleration hardware in APEX OS
 * @param state desired state of serial port debugger
 */
function setDebugMode(state = true) {
    var redis = new Redis(redis_conf_1.default);
    redis.hset("accel_desired_action", "DEBUG_SERIAL_PORT", state ? "1" : "0");
    redis.publish("accel/desired/action/DEBUG_SERIAL_PORT", state ? "1" : "0");
}
/**
 * check is hardware is on state auto aligning returns a promise with the state
 */
function isAutoAligning() {
    return __awaiter(this, void 0, void 0, function* () {
        var redis = new Redis(redis_conf_1.default);
        var result = yield redis.hget("accel_desired_action", "START_ALIGN_PROCESS");
        return result == "1";
    });
}
/**
 * check is hardware is on state acceleration test returns a promise with the state
 */
function isAccelerationTest() {
    return __awaiter(this, void 0, void 0, function* () {
        var redis = new Redis(redis_conf_1.default);
        var result = yield redis.hget("accel_desired_action", "START_SELF_ACCEL_TEST");
        return result == "1";
    });
}
/**
 * check is hardware is on serial port debug mode returns a promise with the state
 */
function isDebugMode() {
    return __awaiter(this, void 0, void 0, function* () {
        var redis = new Redis(redis_conf_1.default);
        var result = yield redis.hget("accel_desired_action", "DEBUG_SERIAL_PORT");
        return result == "1";
    });
}
exports.default = {
    onMotionChange,
    on,
    startAutoAlignment,
    startSelfAccelerationTest,
    setDebugMode,
    isAutoAligning,
    isAccelerationTest,
    isDebugMode
};
