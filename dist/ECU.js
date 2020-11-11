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
 * ECU module get information about EcU monitor and vehicle in ApexOS
 * @module ECU
 */
const Utils_1 = require("./Utils");
const Redis_1 = require("./Redis");
const ECU_PARAM_LIST = require("./ECU.json");
/**
 * ECU PARAM LIST from the ecu monitor
 */
function getECUInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        var resp = yield Utils_1.default.OSExecute(`apx-ecu configure`);
        var resp2 = yield Redis_1.SystemRedisClient.hgetall(`ecumonitor_current_state`);
        return {
            primary_can: resp.PRIMARY_CAN,
            secondary_can: resp.SECONDARY_CAN,
            J1708: resp.J1708,
            listen_only_mode: resp.LISTEN_ONLY_MODE,
            version: resp2.ECUMONITOR_VERSION
        };
    });
}
/**
 *  allows to subscribe for ECU parameter changes
 * @param cb calbback to execute when new ECU data arrives
 * @param errorCallback errorCallback when something wrong goes with the subscription
 */
function watchECUParams(cb, errorCallback) {
    try {
        var handler = (channel, raw) => {
            if (channel != "ecumonitor/parameters")
                return;
            var ecu_values = {};
            raw.split("&").map(param => {
                var [key, value] = param.split("=");
                if (ECU_PARAM_LIST[`${key}`]) {
                    ecu_values[ECU_PARAM_LIST[key].syruslang_param] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                }
                else {
                    ecu_values[`${key}`] = isNaN(parseFloat(value)) ? value : parseFloat(value);
                }
            });
            cb(ecu_values);
        };
        Redis_1.SystemRedisSubscriber.subscribe("ecumonitor/parameters");
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    var returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
        }
    };
    returnable.off = returnable.unsubscribe;
    return returnable;
}
/**
 * Get all the most recent data from ECU parameters
 */
function getECUParams() {
    return __awaiter(this, void 0, void 0, function* () {
        var ecu_params = yield Utils_1.default.OSExecute("apx-ecu list_parameters");
        var ecu_values = {};
        for (const key in ecu_params) {
            const value = ecu_params[key];
            ecu_values[`${key}`] = isNaN(parseFloat(value)) ? value : parseFloat(value);
        }
        return ecu_values;
    });
}
/**
 * get ecu paramas list associated to all the pgn and id for ecu and taip tag associated
 */
function getECUList() {
    return ECU_PARAM_LIST;
}
exports.default = { ECU_PARAM_LIST, getECUParams, getECUList, watchECUParams, getECUInfo };
