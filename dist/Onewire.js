"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Onewire module get information about onewire
 * @module OneWire
 */
const Utils_1 = require("./Utils");
/**
 * allow to get al lthe state of the ibuttons connected
 */
function getAll() {
    return Utils_1.default.OSExecute("apx-onewire-ibutton getall");
}
exports.default = { getAll };
