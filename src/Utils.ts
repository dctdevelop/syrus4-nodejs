/**
 * Utils module some utlities in ApexOS
 * @module Utils
 */
const { exec } = require("child_process");
function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

/**
 * Execute a command in the shell of the APEXOS and returns a promise with the stdout. Promise is rejected if status code is different than 0
 * @param args arguments to pass to the function to execute
 */
function execute (...args) {
	if (args.length == 1) {
		args = args[0].split(" ");
	}
	var command = [...args].join(" ");
	return new Promise((resolve, reject) => {
		exec(command, { timeout: 60000 * 10, maxBuffer: 1024 * 1024 * 5, uid: 1000, gid: 1000 }, (error, stdout, stderr) => {
			if (error) {
				return reject({
					error: error,
					errorText: stderr.toString(),
					output: stdout.toString()
				});
			}
			if (stderr) {
				return reject({
					error: error,
					errorText: stderr.toString(),
					output: stdout.toString()
				});
			}
			var data = stdout.toString();
			try {
				resolve(JSON.parse(data));
			} catch (error) {
				resolve(data);
			}
		});
	});
}

/**
 * Execute a command using sudo in the shell of the APEXOS and returns a promise with the stdout. Promise is rejected if status code is different than 0
 * @param args arguments to pass to the function to execute
 */
function OSExecute(...args) {
	if (args.length == 1) {
		args = args[0].split(" ");
	}
	var command = ["sudo", ...args].join(" ");
	return new Promise((resolve, reject) => {
		exec(command, { timeout: 60000 * 10, maxBuffer: 1024 * 1024 * 5, uid: 1000, gid: 1000 } ,(error, stdout, stderr) => {
			if (error) {
				return reject({
					error: error,
					errorText: stderr.toString(),
					output: stdout.toString()
				});
			}
			if (stderr) {
				return reject({
					error: error,
					errorText: stderr.toString(),
					output: stdout.toString()
				});
			}
			var data = stdout.toString();
			try {
				resolve(JSON.parse(data));
			} catch (error) {
				resolve(data);
			}
		});
	});
}

/**
 * return distance in km between two coordinates points
 * @param coord1 first coordinate to calculate the distance
 * @param coord2 second coordinate to calculate the distance
 */
function distanceBetweenCoordinates(coord1, coord2) {
	if (!coord1 || !coord2) return null;
	var lat1 = coord1.coords.latitude;
	var lon1 = coord1.coords.longitude;
	var lat2 = coord2.coords.latitude;
	var lon2 = coord2.coords.longitude;
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

/**
 * convert coord and imei to JSON receiver format for JSON listener
 * @param coord coordinates of the gps
 * @param imei imei of the device
 * @param siteId the site that the command should be transmitted
 */
function toJSONReceiver(coord, imei, siteId = 1) {
	return [
		{
			ident: imei,
			timestamp: coord.timestamp,
			"device.name": `imei=${imei}&peg=${siteId}`,
			"protocol.id": "syrus4",
			"device.type.id": "syrus4",

			"position.latitude": coord.coords.latitude,
			"position.longitude": coord.coords.longitude,

			"position.direction": coord.coords.bearing,
			"position.speed": coord.coords.speed,
			"position.altitude": coord.coords.altitude,
			"position.hdop": coord.extras.hdop,
			"position.vdop": coord.extras.vdop,
			"position.pdop": coord.extras.pdop,
			"position.satellites": coord.extras.satsActive ? coord.extras.satsActive.length : null,
			"device.battery.percentage": coord.extras.battery || 100,
			"event.label": coord.extras.label || "trckpnt",
			"io.power": true,
			"io.ignition": true,
			"event.enum": 1,
			"device.id": imei
		}
	];
}

export default {
	distanceBetweenCoordinates,
	toJSONReceiver,
	OSExecute,
	execute
};
