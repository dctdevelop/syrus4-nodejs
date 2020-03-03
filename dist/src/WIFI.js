/**
 * WIFI module to interacte with the enable/disable WIFI mode  with Apex OS
 * @module WIFI
 */
var execFile = require("child_process").execFile;
function _handler(verb, ssid, password) {
    if (ssid === void 0) { ssid = null; }
    if (password === void 0) { password = null; }
    return new Promise(function (resolve, reject) {
        var args = ["apx-wifi", verb];
        if (ssid)
            args.push(ssid);
        if (password)
            args.push(password);
        execFile("sudo", args, function (error, stdout, stderr) {
            if (error) {
                console.error(error);
                return reject(error);
            }
            if (stderr) {
                console.error(stderr);
                return reject(stderr);
            }
            var data = stdout.toString();
            resolve(JSON.parse(data));
        });
    });
}
/**
 * It starts a WIFI scan and returns a list of SSIDs
 */
function scan() {
    return _handler("scan");
}
/**
 * It returns the wifi status
 */
function state() {
    return _handler("state");
}
/**
 * It returns the list of networks configured
 */
function list() {
    return _handler("list");
}
/**
 * It enables the WIFI interface and starts the service for connecting with preconfigured networks
 */
function start() {
    return _handler("start");
}
/**
 *  It stops the WIFI service and disables the interface
 */
function stop() {
    return _handler("stop");
}
/**
 * It executes a stop-start in the same call
 */
function reset() {
    return _handler("reset");
}
/**
 * It adds a new network to the WIFI configuration file, in this case you have to include the SSID and psk as parameters. Example apx-wifi add myNet myPass
 * @param ssid The name of SSID you want to connect
 * @param password the password of the SSID
 */
function add(ssid, password) {
    return _handler("add", ssid, password);
}
/**
 * It removes a network from the WIFI configuration file, in this case you have to include the SSID as parametes
 * @param ssid Name of the SSID you want to remove
 */
function remove(ssid) {
    return _handler("add", ssid);
}
exports.default = { scan: scan, state: state, list: list, start: start, stop: stop, reset: reset, add: add, remove: remove };
