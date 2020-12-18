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
 * @module IOS
 */
const Redis_1 = require("./Redis");
const Utils = require("./Utils");
/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName = "*", cb, errorCallback) {
    var chn = `interface/input/${inputName}`;
    if (inputName == "*") {
        chn = `interface/*`;
    }
    else if (inputName[0] == "O") {
        chn = `interface/output/${inputName}`;
    }
    else if (inputName[0] == "A") {
        chn = `interface/analog/${inputName}`;
    }
    var callback = function (pattern, _channel, raw) {
        if (pattern != chn)
            return;
        var input = _channel.split("/")[2];
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
    Redis_1.SystemRedisSubscriber.psubscribe(chn);
    Redis_1.SystemRedisSubscriber.on("pmessage", callback);
    return {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("pmessage", callback);
        }
    };
}
/**
 * get a promise that resolve the current input or output state
 * @param inputName the input/output requested
 */
function getInputState(inputName = "IGN") {
    return __awaiter(this, void 0, void 0, function* () {
        var response = yield Utils.OSExecute(`apx-io get ${inputName}`);
        return response == "true";
    });
}
/**
 * Allow to change the state of an output
 * @param inputName the output to change state
 * @param state the new state  of the output
 */
function setOutputState(inputName = "OUT1", state = true) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Utils.OSExecute(`apx-io set ${inputName} ${state}`);
        return `${state}` == "true";
    });
}
/**
 * Get the current state of all inputs, outputs and analogs in the Syrus4 device
 */
function getAll() {
    return __awaiter(this, void 0, void 0, function* () {
        var response = {};
        var key = null;
        var text = yield Utils.OSExecute(`apx-io getall inputs`);
        if (typeof text == "object") {
            for (const key in text) {
                response[key] = text[key];
            }
        }
        else {
            text = text.split("\n");
            for (const val of text) {
                if (!key) {
                    key = val;
                }
                else {
                    response[key] = val == "true";
                    key = null;
                }
            }
        }
        key = null;
        text = yield Utils.OSExecute(`apx-io getall outputs`);
        if (typeof text == "object") {
            for (const key in text) {
                response[key] = text[key];
            }
        }
        else {
            text = text.split("\n");
            for (const val of text) {
                if (!key) {
                    key = val;
                }
                else {
                    response[key] = val == "true";
                    key = null;
                }
            }
        }
        key = null;
        text = yield Utils.OSExecute(`apx-io getall analogs`);
        if (typeof text == "object") {
            for (const key in text) {
                response[key] = text[key];
            }
        }
        else {
            text = text.split("\n");
            for (const val of text) {
                if (!key) {
                    key = val;
                }
                else {
                    response[key] = parseFloat(val);
                    key = null;
                }
            }
        }
        return response;
    });
}
exports.default = {
    watchInputState,
    getInputState,
    setOutputState,
    getAll
};
