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
const Utils_1 = require("./Utils");
const Redis_1 = require("./Redis");
/**
 * System module get information about ApexOS
 * @module System-Info
 */
/**
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
    return Utils_1.default.OSExecute("apx-about");
}
function modem() {
    return __awaiter(this, void 0, void 0, function* () {
        var response = yield Redis_1.redisClient.hgetall("modem_information");
        return response;
    });
}
/**
 * hanlder to detect power save mode and execute callback 15 seconds before the device goes to sleep
 * @param callback callback to execute when power save mode is on and device is about to turn off
 * @param errorCallback callbac to execute in case of any error
 */
function onSleepOn(callback, errorCallback) {
    try {
        var handler = (channel, raw) => {
            if (channel !== "interface/notification/PSM" && channel !== "interface/notification/PSM_ACTIVATED")
                return;
            callback(raw);
        };
        Redis_1.redisSubscriber.subscribe("interface/notification/PSM");
        Redis_1.redisSubscriber.subscribe("interface/notification/PSM_ACTIVATED");
        Redis_1.redisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    var returnable = {
        unsubscribe: () => {
            Redis_1.redisSubscriber.off("message", handler);
        }
    };
    returnable.off = returnable.unsubscribe;
    return returnable;
}
// async function getSleepOffReason(){
//     var data = await redis.hgetall("current_interface_information");
//     data["SOC_RST_REASON"]
// }
exports.default = { info, modem, onSleepOn };
