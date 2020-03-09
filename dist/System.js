"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
/**
 * System module get information about ApexOS
 * @module System-Info
 */
/**
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
    return Utils_1.default.OSExecute("apx-about");
}
exports.default = { info };
