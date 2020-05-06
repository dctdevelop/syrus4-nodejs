import Utils from "./Utils";

/**
 * WIFI module to interacte with the enable/disable WIFI mode  with Apex OS
 * @module WIFI
 */

/**
 * It starts a WIFI scan and returns a list of SSIDs
 */
function scan() {
	return Utils.OSExecute("apx-wifi", "scan");
}
/**
 * It returns the wifi status
 */
function state() {
	return Utils.OSExecute("apx-wifi", "state");
}
/**
 * It returns the list of networks configured
 */
function list() {
	return Utils.OSExecute("apx-wifi", "list");
}
/**
 * It enables the WIFI interface and starts the service for connecting with preconfigured networks
 */
function start() {
	return Utils.OSExecute("apx-wifi", "start");
}
/**
 *  It stops the WIFI service and disables the interface
 */
function stop() {
	return Utils.OSExecute("apx-wifi", "stop");
}

/**
 * It executes a stop-start in the same call
 */
function reset() {
	return Utils.OSExecute("apx-wifi", "reset");
}

/**
 * It adds a new network to the WIFI configuration file, in this case you have to include the SSID and psk as parameters. Example apx-wifi add myNet myPass
 * @param ssid The name of SSID you want to connect
 * @param password the password of the SSID
 */
function add(ssid, password) {
	return Utils.OSExecute("apx-wifi", "add", `"${ssid}"`, `"${password}"`);
}
/**
 * It removes a network from the WIFI configuration file, in this case you have to include the SSID as parametes
 * @param ssid Name of the SSID you want to remove
 */
function remove(ssid) {
	return Utils.OSExecute("apx-wifi", "remove", `"${ssid}"`);
}

export default { scan, state, list, start, stop, reset, add, remove };
