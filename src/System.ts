import Utils from "./Utils";
import * as Redis from "ioredis";
/**
 * System module get information about ApexOS
 * @module System-Info
 */

/**
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
	return Utils.OSExecute("apx-about");
}

async function modem() {
	var reader = new Redis();
	var response = await reader.hgetall("modem_information");
	reader = null;
	return response;
}

export default { info, modem };
