/**
 * Update module check for update and make update for ApexOS
 * @module Update
 */
const { execFile } = require("child_process");
function _handler(command = "apx-os-update", verb, arg2?) {
	return new Promise((resolve, reject) => {
		var args = [command, verb];
		if (arg2) args.push(arg2);
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
			try {
				data = JSON.parse(data);
				resolve(data);
			} catch (error) {
				resolve({ results: data });
			}
		});
	});
}

/**
 * Check if an update is available in the dctserver for Core Ccomponentss
 */
function checkCore() {
	return _handler("apx-core-update", "check");
}

/**
 * Start the update of the core packages by using the dctserver
 * @param force The same as start but without checking the network interface
 */
function UpdateCore(force = false) {
	return _handler("apx-core-update", force ? "force" : "install");
}

/**
 * list installed packages from OS components in the distribution
 */
function listOS() {
	return _handler("apx-os-update", "list");
}

/**
 * Check if an update is available in the dctserver for OS apps and return a list of the latest version of the packages
 */
function checkOS() {
	return _handler("apx-os-update", "check");
}

/**
 * allows to recover from broken packages when a bad install or updates happens
 */
function recoverOS() {
	return _handler("apx-os-update", "recover");
}

/**
 * Start the update of the OS components by using the dctserver
 * @param force The same as start but without checking the network interface
 */
function updateOS() {
	return _handler("apx-os-update", "install");
}

/**
 * upgrade a package to the lastest version available in the dctserver
 * @param package_name the name of the  package that it wants to be updated
 */
function installOS(package_name) {
	if (!package_name) {
		throw "package_name required";
	}
	return _handler("apx-os-update", "install", package_name);
}

export default {
	checkCore,
	UpdateCore,

	listOS,
	checkOS,
	recoverOS,
	updateOS,
	installOS
};
