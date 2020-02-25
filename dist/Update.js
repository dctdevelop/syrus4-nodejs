"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Update module check for update and make update for ApexOS
 * @module Update
 */
const { execFile } = require("child_process");
function _handler(verb, force = false) {
    return new Promise((resolve, reject) => {
        var args = ["apx-update"];
        if (force)
            args.push("force");
        else
            args.push(verb);
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
            resolve(JSON.parse(data));
        });
    });
}
/**
 * Check if an update is available in the dctserver
 */
function check() {
    return _handler("check");
}
/**
 * Start the update by using the dctserver or specifying the location
 * @param force The same as start but without checking the network interface
 */
function update(force = false) {
    return _handler("update", force);
}
exports.default = { check, update };
