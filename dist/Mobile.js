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
exports.onModemChange = exports.set = exports.getInfo = void 0;
const Utils = require("./Utils");
const Redis_1 = require("./Redis");
const System_1 = require("./System");
/**
 * returns a JSON with the configured values in RF
 */
function getInfo() {
    return Utils.OSExecute("apx-mdm state");
}
exports.getInfo = getInfo;
/**
 * Use this option to configure the network variable for mobile networks
 * @param key the paramter to be configured, posible values are: "apn", "user", "pin", "pass"
 * @param value the new value of the parameter
 */
function set(key, value) {
    if (key == "pin" && value.length != 4) {
        return new Promise((_resolve, reject) => {
            reject("Pin must be exaclty four characters");
        });
    }
    return Utils.OSExecute("apx-mdm", key, value);
}
exports.set = set;
function onModemChange(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "modem/notification/*";
        // subscribe to receive updates
        try {
            var state = yield System_1.default.modem();
            var handler = (pattern, channel, data) => {
                if (pattern != topic)
                    return;
                let key = channel.split('/')[2];
                if ('VOICE_CALL,SMS_RX'.includes(key))
                    data = JSON.parse(data);
                state[key] = data;
                callback(state);
            };
            Redis_1.SystemRedisSubscriber.on("pmessage", handler);
            Redis_1.SystemRedisSubscriber.psubscribe(topic);
        }
        catch (error) {
            console.error(error);
            errorCallback(error);
        }
        let returnable = {
            unsubscribe: () => {
                Redis_1.SystemRedisSubscriber.off("pmessage", handler);
                Redis_1.SystemRedisSubscriber.punsubscribe(topic);
            },
            off: function () { this.unsubscribe(); }
        };
        return returnable;
    });
}
exports.onModemChange = onModemChange;
