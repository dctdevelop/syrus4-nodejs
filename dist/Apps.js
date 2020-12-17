"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Apps module to start/stop/enable/disable/install third parts apps running in apex-os
 * @module Apps
 */
const fs = require("fs");
const Utils = require("./Utils");
/**
 * allows to execute commands from the apps-manager utility from ApexOs
 * @param action action to execute
 * @param app the name of the App
 * @param zipPath the zip location unde where unzip the app
 */
function execute(action, app = null, zipPath = null) {
    return Utils.OSExecute("apx-apps", action, app, zipPath);
}
/**
 * Start an application under /data/applications folder
 * @param app the name of the app
 */
function start(app) {
    return execute("start", app);
}
/**
 * Stop an application under /data/applications folder
 * @param app the name of the app
 */
function stop(app) {
    return execute("stop", app);
}
/**
 * Restart an application under /data/applications folder
 * @param app the name of the app
 */
function restart(app) {
    return execute("restart", app);
}
/**
 * Enable an application for start on boot under /data/applications folder
 * @param app the name of the app
 */
function enable(app) {
    return execute("enable", app);
}
/**
 * Disable an application for start on boot under /data/applications folder
 * @param app the name of the app
 */
function disable(app) {
    return execute("disable", app);
}
/**
 * List all the running applications
 */
function list() {
    return execute("list", null);
}
/**
 * return the state of the app
 * @param app the name of the app
 */
function state(app) {
    return execute("state", app);
}
/**
 *  Allows install an app receive as parameter the name of the app and the zip location or the data of the zip in question
 * @param app the name of the app
 * @param zipPath the zip location
 */
function install(app, zipPath) {
    return new Promise((resolve, reject) => {
        if (typeof zipPath != "string") {
            fs.writeFileSync(`./${app}.tar.gz`, zipPath);
            zipPath = `./${app}.tar.gz`;
        }
        return execute("install", app, zipPath)
            .then(resolve)
            .catch(reject);
    });
}
/**
 * Uninstall and deletes the data from an app
 * @param app the name of the app
 */
function uninstall(app) {
    return execute("uninstall", app);
}
/**
 * write .env file configuration of the app, if the .env exists, replace it
 * @param app the name of the app
 * @param newConfig
 */
function setConfiguration(app, newConfig) {
    if (!app) {
        app = Utils.getPrefix();
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(`/data/app_data/${app}/.configuration.json`, newConfig, function (err) {
            if (err)
                return reject(err);
            return resolve({ status: "ok" });
        });
    });
}
/**
 * Get the contents of .configuration.json file where it stored the configuration of the app
 * @param app the name of the app
 */
function getConfiguration(app) {
    if (!app) {
        app = Utils.getPrefix();
    }
    return new Promise((resolve, reject) => {
        try {
            var data = fs.readFileSync(`/data/app_data/${app}/.configuration.json`);
        }
        catch (error) {
            return resolve({});
        }
        try {
            return resolve(JSON.parse(data.toString()));
        }
        catch (error) {
            return reject(error);
        }
    });
}
exports.default = {
    start,
    stop,
    enable,
    disable,
    restart,
    list,
    state,
    install,
    uninstall,
    getConfiguration,
    setConfiguration
};
