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
exports.onFuelEvent = exports.setFuelling = exports.setConsumption = exports.getStatus = void 0;
/**
 * Technoton module get information about Technoton fuel level
 * @module Technoton
 */
const Redis_1 = require("./Redis");
const Utils = require("./Utils");
function getStatus() {
    return Utils.OSExecute(`apx-serial-fs status`);
}
exports.getStatus = getStatus;
function setConsumption(threshold, window) {
    if (threshold == undefined)
        throw "Consumption threshold required";
    if (window == undefined)
        throw "Consumption window required";
    return Utils.OSExecute(`apx-serial-fs set --consumption-threshold=${threshold} --consumption-window=${window}`);
}
exports.setConsumption = setConsumption;
function setFuelling(threshold) {
    if (threshold == undefined)
        throw "Fuelling threshold required";
    return Utils.OSExecute(`apx-serial-fs set --fuelling-threshold=${threshold}`);
}
exports.setFuelling = setFuelling;
function onFuelEvent(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "serial/notification/fuel_sensor/state";
        // Get last Fuel data
        let last_data = yield getStatus().catch(console.error);
        // Response not void and valid
        if (last_data && (last_data.level != undefined)) {
            const fuel_event = {
                connected: (last_data.state == "connected") ? true : false,
                frequency: last_data.frequency,
                level: last_data.level,
                temperature: last_data.temperature,
                timestamp: last_data.timestamp,
                event: null
            };
            callback(fuel_event);
        }
        else {
            // Response not there
            const fuel_event = {
                connected: false,
                frequency: 0,
                level: 0,
                temperature: 0,
                timestamp: 0,
                event: null
            };
            callback(fuel_event);
        }
        // Subscribe to receive redis updates
        try {
            var state;
            var handler = (channel, data) => {
                if (channel != topic)
                    return;
                state = JSON.parse(data);
                callback(state);
            };
            Redis_1.SystemRedisSubscriber.subscribe(topic);
            Redis_1.SystemRedisSubscriber.on("message", handler);
        }
        catch (error) {
            console.error('onFuelEvent error:', error);
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
exports.onFuelEvent = onFuelEvent;
