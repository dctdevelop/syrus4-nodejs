import Utils from "./Utils";
import { redisClient as redis } from "./Redis";
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
	var response = await redis.hgetall("modem_information");
	return response;
}

export default { info, modem };
