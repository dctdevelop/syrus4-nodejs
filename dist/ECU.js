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
exports.getECUList = exports.getECUParams = exports.watchECUParams = exports.getECUInfo = void 0;
/**
 * ECU module get information about EcU monitor and vehicle in ApexOS
 * @module ECU
 */
const tag_params_1 = require("tag-params");
const Utils = require("./Utils");
const Redis_1 = require("./Redis");
const ECU_PARAM_LIST = require("./ECU_fields.json");
/**
 * ECU PARAM LIST from the ecu monitor
 */
function getECUInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        var resp = yield Utils.OSExecute(`apx-ecu configure`);
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
exports.getECUInfo = getECUInfo;
function template(strings, ...keys) {
    let result = [strings[0]];
    keys.forEach((key, i) => {
        result.push(key, strings[i + 1]);
    });
    return result.join('');
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
            const ecu_values = {};
            raw.split("&").map(param => {
                const [key, value] = param.split("=");
                const element = ECU_PARAM_LIST[key] || {};
                const { syruslang_param, syruslang_prefix, syruslang_suffix, tokenizer, itemizer } = element;
                // save values directly, even if broken down
                let fvalue = isNaN(Number(value)) ? value : Number(value);
                if (syruslang_param) {
                    ecu_values[syruslang_param] = fvalue;
                }
                ecu_values[key] = fvalue;
                if (!(tokenizer || itemizer))
                    return;
                if (!value.includes(tokenizer))
                    return;
                let tokens;
                let regex = /(?<value>.*)/;
                if (itemizer) {
                    regex = new RegExp(itemizer);
                }
                tokens = [value];
                if (tokenizer) {
                    tokens = value.split(tokenizer);
                }
                for (const token of tokens) {
                    try {
                        let skey = syruslang_param;
                        let { groups } = regex.exec(token);
                        let tags;
                        if (syruslang_prefix) {
                            tags = tag_params_1.params(syruslang_prefix, groups);
                            skey = `${template(...tags)}.${skey}`;
                        }
                        if (syruslang_suffix) {
                            tags = tag_params_1.params(syruslang_suffix, groups);
                            skey = `${skey}.${template(...tags)}`;
                        }
                        let svalue = isNaN(Number(groups.value)) ? groups.value : Number(groups.value);
                        ecu_values[skey] = svalue;
                    }
                    catch (error) {
                        console.error({ error, key, token, regex });
                    }
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
    const returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
        }
    };
    returnable.off = returnable.unsubscribe;
    return returnable;
}
exports.watchECUParams = watchECUParams;
/**
 * Get all the most recent data from ECU parameters
 */
function getECUParams() {
    return __awaiter(this, void 0, void 0, function* () {
        const ecu_params = yield Utils.OSExecute("apx-ecu list_parameters");
        const ecu_values = {};
        for (const key in ecu_params) {
            const value = ecu_params[key];
            ecu_values[`${key}`] = isNaN(Number(value)) ? value : Number(value);
        }
        return ecu_values;
    });
}
exports.getECUParams = getECUParams;
/**
 * get ecu paramas list associated to all the pgn and id for ecu and taip tag associated
 */
function getECUList() {
    return ECU_PARAM_LIST;
}
exports.getECUList = getECUList;
exports.default = { ECU_PARAM_LIST, getECUParams, getECUList, watchECUParams, getECUInfo };
