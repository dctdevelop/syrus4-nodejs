"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = require("./Utils");
/**
 * Mobile module to interacte with the Mobile Network allow to set rf configurations and read them
 * @module Mobile
 */
/**
 * returns a JSON with the configured values in RF
 */
function getInfo() {
    return Utils.OSExecute("apx-rf-conf", "read");
}
/**
 * Use this option to configure the network variable for mobile networks
 * @param key the paramter to be configured, posible values are: "apn", "user", "pin", "pass"
 * @param value the new value of the parameter
 */
function set(key, value) {
    if (key == "pin" && value.length != 4) {
        return new Promise((_resolve, reject) => {
            reject("Pin must be exaclty four characters");
        });
    }
    return Utils.OSExecute("apx-rf-conf", key, value);
}
exports.default = {
    getInfo,
    set
};
