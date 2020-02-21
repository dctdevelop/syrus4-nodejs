"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Hotspot module to interacte with the enable/disable Hotspot mode  with Apex OS
 * @module Hotspot
 */
const { execFile } = require("child_process");
function _handler(verb, param1 = null, param2 = null) {
    return new Promise((resolve, reject) => {
        var args = ["apx-hotspot", verb];
        if (param1)
            args.push(param1);
        if (param2)
            args.push(param2);
        execFile("sudo", args, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return reject(error);
            }
            if (stderr) {
                console.error(stderr);
                return reject(stderr);
            }
            var data = stdout.toString();
            try {
                data = JSON.parse(data);
                resolve(data);
            }
            catch (error) {
                resolve(true);
            }
        });
    });
}
/**
 * returns the list of the connected clients to the hotspot
 */
function list() {
    return _handler("list");
}
/**
 * returns the state of the connected clients to the hotspot
 */
function state() {
    return _handler("state");
}
/**
 * start the hotspot service, also stop wifi service
 */
function start() {
    return _handler("start");
}
/**
 *  stops the hotspot service
 */
function stop() {
    return _handler("stop");
}
/**
 *  executes a stop-start in the same call
 */
function reset() {
    return _handler("reset");
}
/**
 * Use this option for forwarding the wlan traffic to another interface, it allows you to have internet access by specifying the output interface
 * @param netInterface Interface you ant allow internet access default="ppp0"
 */
function route(netInterface = "ppp0") {
    return _handler("route", netInterface);
}
/**
 * edits the parameter received in the hotspot configuration file. <br>
 * Example apx-hotspot edit wpa_passphrase myNewPass1234
 * Possible Values: "wpa_passphrase" | "ssid" | "max_num_sta" | "channel" | "wpa_key_mgmt"
 * @param parameter param to edit config
 * @param newValue new value for the parameter
 */
function edit(parameter = "wpa_passphrase", newValue) {
    return _handler("edit", parameter, newValue);
}
exports.default = { list, state, start, stop, reset, route, edit };
//# sourceMappingURL=Hotspot.js.map