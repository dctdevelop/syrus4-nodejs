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
var publisher = new Redis();
var notis = new Redis();
var reader = new Redis();
/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName = "*", cb, errorCallback) {
    var channel = `interface/input/${inputName}`;
    if (inputName == "*") {
        channel = `interface/*`;
    }
    else if (inputName[0] == "O") {
        channel = `interface/output/${inputName}`;
    }
    else if (inputName[0] == "A") {
        channel = `interface/analog/${inputName}`;
    }
    var callback = function (_pattern, channel, raw) {
        var input = channel.split("/")[2];
        if (inputName == "*" || input == inputName) {
            var returnable = raw;
            if (raw == "true")
                returnable = true;
            if (raw == "false")
                returnable = false;
            var response = {};
            response[input] = returnable;
            cb(response);
        }
    };
    // console.log("channel name:", channel);
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
        var response = yield reader.hget(channel, inputName);
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
        reader.hset("desired_output_state", inputName, `${state}`);
        publisher.publish(`desired/interface/output/${inputName}`, `${state}`, console.error);
        resolve(state);
    });
}
/**
 * Get the current state of all inputs, outputs and analogs in the Syrus4 device
 */
function getAll() {
    return __awaiter(this, void 0, void 0, function* () {
        var inputs = (yield reader.hgetall("current_input_state")) || {};
        var outputs = (yield reader.hgetall("current_output_state")) || {};
        var analogs = (yield reader.hgetall("current_analog_state")) || {};
        var response = Object.assign(inputs, outputs);
        response = Object.assign(response, analogs);
        Object.keys(response).forEach(key => {
            if (response[key] == "true")
                response[key] = true;
            if (response[key] == "false")
                response[key] = false;
            if (parseFloat(response[key]))
                response[key] = parseFloat(response[key]);
        });
        return response;
    });
}
exports.default = {
    watchInputState,
    getInputState,
    setOutputState,
    getAll
};
