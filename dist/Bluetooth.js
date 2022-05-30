"use strict";
/**
 * Serial module, get information about serial state
 * @module Serial
 */
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
exports.onAppConsoleMessage = exports.onBluetoothUpdate = void 0;
const Redis_1 = require("./Redis");
// import * as Utils from "./Utils"
function onBluetoothUpdate(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "bluetooth/notification/*";
        try {
            var handler = (pattern, channel, data) => {
                if (!channel.startsWith('bluetooth/notification'))
                    return;
                let clearToSend = true;
                let json_string = '{}';
                let json_object = {};
                try {
                    json_object = JSON.parse(data);
                }
                catch (error) {
                    clearToSend = false;
                    console.log('onBluetoothUpdate error:', error);
                }
                if (clearToSend) {
                    callback(channel, json_object);
                }
                else if (channel == 'bluetooth/notification/MODE') {
                    const enabled = (data == 'ENABLED') ? true : false;
                    json_string = `{"enabled":${enabled}}`;
                    json_object = JSON.parse(json_string);
                    callback(channel, json_object);
                }
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
exports.onBluetoothUpdate = onBluetoothUpdate;
function onAppConsoleMessage(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "bluetooth/messages/user_apps_console";
        // const topic = "bluetooth/user_apps_console/MESSAGE"
        // subscribe to receive updates
        try {
            var handler = (channel, data) => {
                if (channel != topic)
                    return;
                callback(data);
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
    });
}
exports.onAppConsoleMessage = onAppConsoleMessage;
