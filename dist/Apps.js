"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Apps module to start/stop/enable/disable/install third parts apps running in apex-os
 * @module Apps
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Utils = __importStar(require("./Utils"));
// Environment
let { APP_DATA_FOLDER } = process.env;
let { SYRUS4G_APP_DATA_DIR, SYRUS4G_APP_CONF_FILE } = process.env;
if (!SYRUS4G_APP_DATA_DIR)
    SYRUS4G_APP_DATA_DIR = '/data/app_data';
if (!SYRUS4G_APP_CONF_FILE)
    SYRUS4G_APP_CONF_FILE = '.configuration.json';
/**
 * allows to execute commands from the apps-manager utility from ApexOs
 * @param action action to execute
 * @param app the name of the App
 * @param zipPath the zip location unde where unzip the app
 */
function execute(action, app = null, zipPath = null) {
    return Utils.OSExecute("syrus-apps-manager", action, app, zipPath);
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
        let conf_path = path.join(SYRUS4G_APP_DATA_DIR, app, SYRUS4G_APP_CONF_FILE);
        fs.writeFile(conf_path, newConfig, function (err) {
            if (err)
                reject(err);
            resolve({ status: "ok" });
        });
    });
}
/**
 * Get the contents of SYRUS4G_APP_CONF_FILE file where it stored the configuration of the app
 * @param app the name of the app
 */
function getConfiguration(app) {
    if (!app) {
        app = Utils.getPrefix();
    }
    return new Promise((resolve, reject) => {
        try {
            let conf_path;
            if (APP_DATA_FOLDER === null || APP_DATA_FOLDER === void 0 ? void 0 : APP_DATA_FOLDER.length) {
                conf_path = path.join(APP_DATA_FOLDER, SYRUS4G_APP_CONF_FILE);
            }
            else {
                conf_path = path.join(SYRUS4G_APP_DATA_DIR, app, SYRUS4G_APP_CONF_FILE);
            }
            var data = fs.readFileSync(conf_path);
            resolve(JSON.parse(data.toString()));
        }
        catch (error) {
            reject(error);
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
