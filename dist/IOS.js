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
 * IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
 * TODO: implement this
 * @module IOS
 */
const Redis = require("ioredis");
var redis = new Redis();
var notis = new Redis();
/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName = "IGN", cb, errorCallback) {
    var channel = `interface/input/${inputName}`;
    if (inputName[0] == "O") {
        channel = `interface/output/${inputName}`;
    }
    if (inputName[0] == "A") {
        channel = `interface/analog/${inputName}`;
    }
    var callback = function (_pattern, channel, raw) {
        var input = channel.split("/")[2];
        if (input == inputName) {
            var returnable = raw;
            if (raw == "true")
                returnable = true;
            if (raw == "false")
                returnable = false;
            cb(returnable);
        }
    };
    console.log("channel name:", channel);
    notis.psubscribe(channel);
    notis.on("pmessage", callback);
    return {
        unsubscribe: () => {
            notis.off(`${channel}`, callback);
        }
    };
}
/**
 * get a promise that resolve the current input or output state
 * @param inputName the input/output requested
 */
function getInputState(inputName = "IGN") {
    var channel = "current_input_state";
    if (inputName[0] == "O") {
        channel = "current_output_state";
    }
    if (inputName[0] == "A") {
        channel = "current_analog_state";
    }
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        var response = yield redis.hget(channel, inputName);
        var returnable = response;
        if (response == "true")
            returnable = true;
        if (response == "false")
            returnable = false;
        resolve(returnable);
    }));
}
/**
 * Allow to change the state of an output
 * @param inputName the output to change state
 * @param state the new state  of the output
 */
function setOutputState(inputName = "OUT1", state = true) {
    return new Promise((resolve, reject) => {
        redis.hset("desired_output_state", inputName, `${state}`);
        notis.publish(`desired/interface/output/${inputName}`, `${state}`);
        resolve(state);
    });
}
exports.default = {
    watchInputState,
    getInputState,
    setOutputState
};
