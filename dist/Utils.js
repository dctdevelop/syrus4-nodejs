"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { exec } = require("child_process");
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
exports.default = {
    distanceBetweenCoordinates: (coord1, coord2) => {
        if (!coord1 || !coord2)
            return null;
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
    },
    toJSONReceiver: (coord, imei, siteId = 1) => {
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
    },
    OSExecute(...args) {
        if (args.length == 1) {
            args = args[0].split(" ");
        }
        var command = ["sudo", ...args].join(" ");
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
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
                }
                catch (error) {
                    resolve(data);
                }
            });
        });
    }
};
