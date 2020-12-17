"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = require("./Utils");
/**
 * Update module check for update and make update for ApexOS
 * @module Update
 */
/**
 * Check if an update is available in the dctserver for Core Ccomponentss
 */
function checkCore() {
    return Utils.OSExecute("apx-core-update", "check");
}
/**
 * Start the update of the core packages by using the dctserver
 * @param force The same as start but without checking the network interface
 */
function UpdateCore(force = false) {
    return Utils.OSExecute("apx-core-update", force ? "force" : "install");
}
/**
 * list installed packages from OS components in the distribution
 */
function listOS() {
    return Utils.OSExecute("apx-os-update", "list");
}
/**
 * Check if an update is available in the dctserver for OS apps and return a list of the latest version of the packages
 */
function checkOS() {
    return Utils.OSExecute("apx-os-update", "check");
}
/**
 * allows to recover from broken packages when a bad install or updates happens
 */
function recoverOS() {
    return Utils.OSExecute("apx-os-update", "recover");
}
/**
 * Start the update of the OS components by using the dctserver
 * @param force The same as start but without checking the network interface
 */
function updateOS() {
    return Utils.OSExecute("apx-os-update", "start");
}
/**
 * upgrade a package to the lastest version available in the dctserver
 * @param package_name the name of the  package that it wants to be updated
 */
function installOS(package_name) {
    if (!package_name) {
        throw "package_name required";
    }
    return Utils.OSExecute("apx-os-update", "install", package_name);
}
exports.default = {
    checkCore,
    UpdateCore,
    listOS,
    checkOS,
    recoverOS,
    updateOS,
    installOS
};
