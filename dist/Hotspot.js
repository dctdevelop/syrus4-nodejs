"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Hotspot module to interacte with the enable/disable Hotspot mode  with Apex OS
 * @module Hotspot
 */
const Utils_1 = require("./Utils");
/**
 * returns the list of the connected clients to the hotspot
 */
function list() {
    return Utils_1.default.OSExecute("apx-hotspot", "list");
}
/**
 * returns the state of the connected clients to the hotspot
 */
function state() {
    return Utils_1.default.OSExecute("apx-hotspot", "state");
}
/**
 * start the hotspot service, also stop wifi service
 */
function start() {
    return Utils_1.default.OSExecute("apx-hotspot", "start");
}
/**
 *  stops the hotspot service
 */
function stop() {
    return Utils_1.default.OSExecute("apx-hotspot", "stop");
}
/**
 *  executes a stop-start in the same call
 */
function reset() {
    return Utils_1.default.OSExecute("apx-hotspot", "reset");
}
/**
 * Use this option for forwarding the wlan traffic to another interface, it allows you to have internet access by specifying the output interface
 * @param netInterface Interface you ant allow internet access default="ppp0"
 */
function route(netInterface = "ppp0") {
    return Utils_1.default.OSExecute("apx-hotspot", "route", netInterface);
}
/**
 * edits the parameter received in the hotspot configuration file. <br>
 * Example apx-hotspot edit wpa_passphrase myNewPass1234
 * Possible Values: "wpa_passphrase" | "ssid" | "max_num_sta" | "channel" | "wpa_key_mgmt"
 * @param parameter param to edit config
 * @param newValue new value for the parameter
 */
function edit(parameter = "wpa_passphrase", newValue) {
    return Utils_1.default.OSExecute("apx-hotspot", parameter, newValue);
}
exports.default = { list, state, start, stop, reset, route, edit };
