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
const Redis_1 = require("./Redis");
const Utils = require("./Utils");
function IsConnected(net) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var raw = yield Utils.OSExecute(`ip route | grep ${net}`);
        }
        catch (error) {
            // Error means no text so grep return empty which is means disconnected
            return false;
        }
        return !(raw.length == 0 || raw.indexOf("linkdown") > -1);
    });
}
/**
 * Watch the network state change
 * @param callback callback to executed when network state changes
 * @param errorCallback callback to execute in case of error
 */
function onNetworkChange(callback, errorCallback) {
    let handler;
    try {
        handler = (channel, raw) => {
            if (channel !== "network/interface")
                return;
            callback(raw);
        };
        Redis_1.SystemRedisSubscriber.subscribe("network/interface");
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
/**
 * get the current state of the network of the APEX OS, returns a promise with the info
 */
function getActiveNetwork() {
    return __awaiter(this, void 0, void 0, function* () {
        let net = yield Redis_1.SystemRedisClient.get("network_interface").catch(Utils.$throw);
        let data = {};
        if (net == "wlan0") {
            data = yield Utils.OSExecute("apx-wifi", "state").catch(Utils.$throw);
        }
        data = Object.assign(data, yield getNetworkInfo(net).catch(Utils.$throw));
        return { network: net, information: data };
    });
}
/**
 * get Network Information about specific network
 * @param net  network that want to know the information valid options are: eth0, ppp0, wlan0
 */
function getNetworkInfo(net) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = {};
        if (net == "none") {
            return {
                connected: false
            };
        }
        let raw = yield Utils.OSExecute(`ifconfig ${net}`).catch(Utils.$throw);
        if (net == "ppp0") {
            let modemInfo = yield Redis_1.SystemRedisClient.hgetall("modem_information");
            data.imei = modemInfo.IMEI;
            data.operator = modemInfo.OPERATOR;
            data.imsi = modemInfo.SIM_IMSI;
            data.iccid = modemInfo.SIM_ID;
            data.mcc = modemInfo.MCC_MNC.substring(0, 3);
            data.mnc = modemInfo.MCC_MNC.substring(3);
        }
        if (net == "wlan0") {
            try {
                let wifiInfo = yield Utils.OSExecute("apx-wifi state");
                data = Object.assign(data, wifiInfo);
                data.signal = Number(data.signal);
                delete data.ip;
            }
            catch (error) {
                console.error(error);
            }
        }
        let start = raw.indexOf("inet addr:") + 10;
        let end = raw.indexOf(" ", start);
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
        data.connected = yield IsConnected(net).catch(Utils.$throw);
        if (data.ip_address == "") {
            data.ip_address = null;
        }
        return data;
    });
}
/**
 * get network information about all the available networks on APEX OS
 */
function getNetworks() {
    return __awaiter(this, void 0, void 0, function* () {
        let nets = yield Utils.OSExecute(`ifconfig | grep "Link encap:"`).catch(Utils.$throw);
        nets = nets
            .split("\n")
            .map((str) => str.split(" ")[0])
            .filter((str) => str);
        let info = {};
        for (const net of nets) {
            let [resp, err] = yield Utils.$to(getNetworkInfo(net));
            if (err) {
                console.error({ net, err });
                continue;
            }
            info[net] = resp;
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
