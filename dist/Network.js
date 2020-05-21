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
function getActiveNetwork() {
    return __awaiter(this, void 0, void 0, function* () {
        var redis = new Redis(redis_conf_1.default);
        var net = yield redis.get("network_interface");
        var data = {};
        if (net == "wlan0") {
            data = yield Utils_1.default.OSExecute("apx-wifi", "state");
        }
        data = Object.assign(data, yield getNetworkInfo(net));
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
        var raw = yield Utils_1.default.execute(`ifconfig ${net}`);
        if (net == "ppp0") {
            var redis = new Redis(redis_conf_1.default);
            var modemInfo = yield redis.hgetall("modem_information");
            data.imei = modemInfo.IMEI;
            data.operator = modemInfo.OPERATOR;
            data.imsi = modemInfo.SIM_IMSI;
            data.iccid = modemInfo.SIM_ID;
            data.mcm = modemInfo.MCC_MNC.substring(0, 3);
            data.mnc = modemInfo.MCC_MNC.substring(3);
        }
        if (net == "wlan0") {
            try {
                var wifiInfo = yield Utils_1.default.OSExecute("apx-wifi state");
                data = Object.assign(data, wifiInfo);
                data.signal = Number(data.signal);
                delete data.ip;
            }
            catch (error) {
                console.error(error);
            }
        }
        var start = raw.indexOf("inet addr:") + 10;
        var end = raw.indexOf(" ", start);
        if (start > -1)
            data.ip_address = raw.substring(start, end);
        start = raw.indexOf("RX bytes:") + 9;
        end = raw.indexOf(" ", start);
        if (start > -1)
            data["rx_bytes"] = parseInt(raw.substring(start, end));
        start = raw.indexOf("TX bytes:") + 9;
        end = raw.indexOf(" ", start);
        if (start > -1)
            data["tx_bytes"] = parseInt(raw.substring(start, end));
        data.state = "enable";
        if (data.ip_address == "") {
            data.ip_address = null;
            data.state = "disable";
        }
        return data;
    });
}
/**
 * get network information about all the available networks on APEX OS
 */
function getNetworks() {
    return __awaiter(this, void 0, void 0, function* () {
        var nets = yield Utils_1.default.execute(`ifconfig | grep 'Link encap:'`);
        nets = nets.split("\n").map(str => str.split(" ")[0]).filter(str => str);
        var info = {};
        for (const net of nets) {
            info[net] = yield getNetworkInfo(net);
        }
        return info;
    });
}
exports.default = {
    onNetworkChange,
    getActiveNetwork,
    getNetworkInfo,
    getNetworks
};
