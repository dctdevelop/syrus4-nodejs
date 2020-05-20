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
 * Network module get information about networks and events in ApexOS
 * @module Network
 */
const Redis = require("ioredis");
const Utils_1 = require("./Utils");
const redis_conf_1 = require("./redis_conf");
/**
 * Watch the network state change
 * @param callback callback to executed when network state changes
 * @param errorCallback callback to execute in case of error
 */
function onNetworkChange(callback, errorCallback) {
    var redis = new Redis(redis_conf_1.default);
    try {
        var handler = raw => {
            callback(raw);
        };
        redis.subscribe("network/interface");
        redis.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    return {
        unsubscribe: () => {
            redis.off("message", handler);
            redis.unsubscribe("network/interface");
        },
        off: () => {
            redis.off("message", handler);
            redis.unsubscribe("network/interface");
        }
    };
}
/**
 * get the current state of the network of the APEX OS, returns a promise with the info
 */
function getNetworkState() {
    return __awaiter(this, void 0, void 0, function* () {
        var redis = new Redis(redis_conf_1.default);
        var net = yield redis.get("network_interface");
        var data = {};
        if (net == "wlan0") {
            data = yield Utils_1.default.OSExecute("apx-wifi", "state");
        }
        data = Object.assign(data, getNetworkInfo(net));
        return { network: net, information: data };
    });
}
/**
 * get Network Information about specific network
 * @param net  network that want to know the information valid options are: eth0, ppp0, wlan0
 */
function getNetworkInfo(net) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = {};
        if (net == "none") {
            return {};
        }
        var raw = yield Utils_1.default.OSExecute(`ifconfig ${net}`);
        var start = raw.indexOf("inet addr:") + 10;
        var end = raw.indexOf(" ", start);
        if (start > -1)
            data.address = raw.substring(start, end);
        start = raw.indexOf("RX bytes:") + 9;
        end = raw.indexOf(" ", start);
        if (start > -1)
            data["Rx bytes"] = raw.substring(start, end);
        start = raw.indexOf("TX bytes:") + 9;
        end = raw.indexOf(" ", start);
        if (start > -1)
            data["Tx bytes"] = raw.substring(start, end);
        return data;
    });
}
exports.default = {
    onNetworkChange,
    getNetworkState,
    getNetworkInfo
};
