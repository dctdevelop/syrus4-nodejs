"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * System module get information about ApexOS
 * @module System-Info
 */
const { execFile } = require("child_process");
function _handler() {
    return new Promise((resolve, reject) => {
        var args = ["apx-about"];
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
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
    return _handler();
}
exports.default = { info };
//# sourceMappingURL=System.js.map