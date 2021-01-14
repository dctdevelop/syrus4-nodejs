/**
 * Apps module to start/stop/enable/disable/install third parts apps running in apex-os
 * @module Apps
 */
import * as fs from "fs"
import * as path from "path"

import * as Utils from "./Utils"

// Environment
let { APP_DATA_FOLDER } = process.env
let { SYRUS4G_APP_DATA_DIR, SYRUS4G_APP_CONF_FILE } = process.env

if (!SYRUS4G_APP_DATA_DIR) SYRUS4G_APP_DATA_DIR = '/data/app_data'
if (!SYRUS4G_APP_CONF_FILE) SYRUS4G_APP_CONF_FILE = '.configuration.json'

type AppAction = "install" | "uninstall" | "list" | "state" | "enable" | "disable" | "start" | "stop" | "restart";

/**
 * allows to execute commands from the apps-manager utility from ApexOs
 * @param action action to execute
 * @param app the name of the App
 * @param zipPath the zip location unde where unzip the app
 */
function execute(action: AppAction, app: string = null, zipPath: string = null) {
	return Utils.OSExecute("apx-apps", action, app, zipPath);
}

/**
 * Start an application under /data/applications folder
 * @param app the name of the app
 */
function start(app: string) {
	return execute("start", app);
}

/**
 * Stop an application under /data/applications folder
 * @param app the name of the app
 */
function stop(app: string) {
	return execute("stop", app);
}

/**
 * Restart an application under /data/applications folder
 * @param app the name of the app
 */
function restart(app: string) {
	return execute("restart", app);
}

/**
 * Enable an application for start on boot under /data/applications folder
 * @param app the name of the app
 */
function enable(app: string) {
	return execute("enable", app);
}

/**
 * Disable an application for start on boot under /data/applications folder
 * @param app the name of the app
 */
function disable(app: string) {
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
function state(app: string) {
	return execute("state", app);
}

/**
 *  Allows install an app receive as parameter the name of the app and the zip location or the data of the zip in question
 * @param app the name of the app
 * @param zipPath the zip location
 */
function install(app: string, zipPath) {
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
function uninstall(app: string) {
	return execute("uninstall", app);
}

/**
 * write .env file configuration of the app, if the .env exists, replace it
 * @param app the name of the app
 * @param newConfig
 */
function setConfiguration(app: string, newConfig) {
	if (!app) {
		app = Utils.getPrefix()
	}
	return new Promise((resolve, reject) => {
		let conf_path = path.join(SYRUS4G_APP_DATA_DIR, app, SYRUS4G_APP_CONF_FILE)
		fs.writeFile(conf_path, newConfig, function (err) {
			if (err) reject(err);
			resolve({ status: "ok" });
		});
	});
}

/**
 * Get the contents of SYRUS4G_APP_CONF_FILE file where it stored the configuration of the app
 * @param app the name of the app
 */
function getConfiguration(app?: string) {
	if (!app) {
		app = Utils.getPrefix()
	}
	return new Promise((resolve, reject) => {
		try {
			let conf_path: string
			if (APP_DATA_FOLDER?.length){
				conf_path = path.join(APP_DATA_FOLDER, SYRUS4G_APP_CONF_FILE)
			} else{
				conf_path = path.join(SYRUS4G_APP_DATA_DIR, app, SYRUS4G_APP_CONF_FILE)
			}
			var data = fs.readFileSync(conf_path);
			resolve(JSON.parse(data.toString()));
		} catch (error) {
			reject(error);
		}
	});
}

export default {
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
