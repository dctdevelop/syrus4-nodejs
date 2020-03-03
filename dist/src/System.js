/**
 * System module get information about ApexOS
 * @module System-Info
 */
var execFile = require("child_process").execFile;
function _handler() {
    return new Promise(function (resolve, reject) {
        var args = ["apx-about"];
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
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
    return _handler();
}
exports.default = { info: info };
