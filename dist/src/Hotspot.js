/**
 * Hotspot module to interacte with the enable/disable Hotspot mode  with Apex OS
 * @module Hotspot
 */
var execFile = require("child_process").execFile;
"wpa_passphrase" | "ssid" | "max_num_sta" | "channel" | "wpa_key_mgmt";
function _handler(verb, param1, param2) {
    if (param1 === void 0) { param1 = null; }
    if (param2 === void 0) { param2 = null; }
    return new Promise(function (resolve, reject) {
        var args = ["apx-hotspot", verb];
        if (param1)
            args.push(param1);
        if (param2)
            args.push(param2);
        execFile("sudo", args, function (error, stdout, stderr) {
            if (error) {
                console.error(error);
                return reject(error);
            }
            if (stderr) {
                console.error(stderr, stdout);
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
function route(netInterface) {
    if (netInterface === void 0) { netInterface = "ppp0"; }
    return _handler("route", netInterface);
}
/**
 * edits the parameter received in the hotspot configuration file. <br>
 * Example apx-hotspot edit wpa_passphrase myNewPass1234
 * Possible Values: "wpa_passphrase" | "ssid" | "max_num_sta" | "channel" | "wpa_key_mgmt"
 * @param parameter param to edit config
 * @param newValue new value for the parameter
 */
function edit(parameter, newValue) {
    if (parameter === void 0) { parameter = "wpa_passphrase"; }
    return _handler(parameter, newValue);
}
exports.default = { list: list, state: state, start: start, stop: stop, reset: reset, route: route, edit: edit };
