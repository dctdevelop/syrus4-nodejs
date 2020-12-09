"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Onewire module get information about onewire
 * @module Onewire
 */
const Utils_1 = require("./Utils");
/**
 * allow to get al lthe state of the ibuttons connected
 */
function getAll() {
    return Utils_1.default.OSExecute("apx-onewire-ibutton getall");
}
/**
 * allow to get al lthe state of the ibuttons connected
 */
function get(idButton) {
    if (idButton == "")
        throw "idButton is required";
    return Utils_1.default.OSExecute(`apx-onewire-ibutton get ${idButton}`);
}
/**
 * allow to get al lthe state of the ibuttons connected
 */
function create(idButton, aliasName) {
    if (aliasName == "")
        throw "Alias Name is required";
    if (idButton == "")
        throw "idButton is required";
    return Utils_1.default.OSExecute(`apx-onewire-ibutton create ${idButton} ${aliasName}`);
}
function remove(idButton) {
    if (idButton == "")
        throw "idButton is required";
    return Utils_1.default.OSExecute(`apx-onewire-ibutton delete ${idButton}`);
}
exports.default = { getAll, get, create, remove };
