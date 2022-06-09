"use strict";
/**
 * Serial module, get information about serial state
 * @module Serial
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMDTMessage = exports.onIncomingMessage = exports.send = exports.setModemBufferSize = exports.getModemBufferSize = exports.getSerialModemState = exports.setSerialMode = exports.getSerialMode = exports.onFatigueEvent = void 0;
const Redis_1 = require("./Redis");
const Utils = __importStar(require("./Utils"));
// backwards compatability
var Fatigue_1 = require("./Fatigue");
Object.defineProperty(exports, "onFatigueEvent", { enumerable: true, get: function () { return Fatigue_1.onFatigueEvent; } });
/**
 * get serial mode
 */
function getSerialMode() {
    return Utils.OSExecute("apx-serial mode");
}
exports.getSerialMode = getSerialMode;
/**
 * set serial mode (console or modem)
 */
function setSerialMode(mode) {
    return Utils.OSExecute(`apx-serial mode ${mode}`);
}
exports.setSerialMode = setSerialMode;
/**
 * get serial modem state
 */
function getSerialModemState() {
    return Utils.OSExecute("apx-serial modem state");
}
exports.getSerialModemState = getSerialModemState;
/**
 * get modem buffer size
 */
function getModemBufferSize() {
    return Utils.OSExecute(`apx-serial modem buffer_size`);
}
exports.getModemBufferSize = getModemBufferSize;
/**
 * set the buffer size
 */
function setModemBufferSize(size) {
    if (size < 10 || size > 500)
        throw "invalid buffer size, min: 10, max: 500";
    return Utils.OSExecute(`apx-serial modem buffer_size ${size}`);
}
exports.setModemBufferSize = setModemBufferSize;
/**
 * send a message
 */
function send(message) {
    if (!message.length || message.length > 340)
        throw "invalid message length (max 340)";
    return Utils.OSExecute(`apx-serial modem send "${message}"`);
}
exports.send = send;
/**
 * monitor incoming serial messages
 */
async function onIncomingMessage(callback, errorCallback) {
    const topic = "serial/notification/modem/message";
    // set up subscribe to receive updates
    try {
        var handler = (channel, raw) => {
            if (channel != topic)
                return;
            callback(raw);
        };
        Redis_1.SystemRedisSubscriber.subscribe(topic);
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    let returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(topic);
        },
        off: function () { this.unsubscribe(); }
    };
    return returnable;
}
exports.onIncomingMessage = onIncomingMessage;
async function onMDTMessage(callback, errorCallback) {
    const topic = "serial/notification/mdt/pack";
    // subscribe to receive updates
    try {
        var state = { message: null };
        var handler = (channel, data) => {
            if (channel != topic)
                return;
            state.message = data;
            callback(state);
        };
        Redis_1.SystemRedisSubscriber.subscribe(topic);
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    let returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(topic);
        },
        off: function () { this.unsubscribe(); }
    };
    return returnable;
}
exports.onMDTMessage = onMDTMessage;
