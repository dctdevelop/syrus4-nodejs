"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$sleep = exports.$throw = exports.$to = exports.$trycatch = exports.getPrefix = exports.toJSONReceiver = exports.distanceBetweenCoordinates = exports.execute = exports.OSExecute = void 0;
/**
 * Utils module some utlities in ApexOS
 * @module Utils
 */
const child_process_1 = require("child_process");
const os_1 = require("os");
const path = require("path");
const ssh2_1 = require("ssh2");
let { APP_DATA_FOLDER } = process.env;
let { SYRUS4G_REMOTE, SYRUS4G_APP_NAME } = process.env;
const USERNAME = os_1.userInfo().username;
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
var __shell_promise;
function getShell() {
    return __awaiter(this, void 0, void 0, function* () {
        if (__shell_promise)
            return yield __shell_promise;
        const { SYRUS4G_REMOTE_SSH_HOST, SYRUS4G_REMOTE_SSH_PORT, SYRUS4G_REMOTE_SSH_USERNAME, SYRUS4G_REMOTE_SSH_PW } = process.env;
        console.log("setting up remote shell", {
            SYRUS4G_REMOTE_SSH_HOST,
            SYRUS4G_REMOTE_SSH_PORT,
            SYRUS4G_REMOTE_SSH_USERNAME,
            SYRUS4G_REMOTE_SSH_PW: "*".repeat(SYRUS4G_REMOTE_SSH_PW.length)
        });
        __shell_promise = new Promise((resolve, reject) => {
            let conn = new ssh2_1.Client();
            let timeout = setTimeout(reject, 1000 * 20);
            conn.on('ready', () => {
                clearTimeout(timeout);
                resolve(conn);
            });
            conn.on('close', () => {
                console.error('ssh:close', arguments);
                __shell_promise = null;
            });
            conn.on('end', () => {
                console.error('ssh:end', arguments);
                __shell_promise = null;
            });
            conn.connect({
                host: SYRUS4G_REMOTE_SSH_HOST,
                port: parseInt(SYRUS4G_REMOTE_SSH_PORT),
                username: SYRUS4G_REMOTE_SSH_USERNAME,
                password: SYRUS4G_REMOTE_SSH_PW,
            });
        });
        return __shell_promise;
    });
}
// TODO: !important remove the root check and uid settings
/**
 * Execute a command using sudo in the shell of the APEXOS and returns a promise with the stdout. Promise is rejected if status code is different than 0
 * @param args arguments to pass to the function to execute
 */
function OSExecute(...args) {
    return __awaiter(this, void 0, void 0, function* () {
        var command = args.map((x) => x.trim()).join(" ");
        let opts = { timeout: 60000 * 10, maxBuffer: 1024 * 1024 * 5 };
        if (command.startsWith("apx-"))
            command = `sudo ${command}`;
        if (SYRUS4G_REMOTE) {
            // command = `${SYRUS4G_REMOTE} <<'__S4REMOTE_EOF__'\n${command}\n__S4REMOTE_EOF__`
            let shell = yield getShell();
            return new Promise((resolve, reject) => {
                shell.exec(command, (error, stream) => {
                    if (error) {
                        reject({
                            command,
                            error
                        });
                    }
                    let stdout, stderr;
                    stream.on('data', (data) => {
                        stdout = data;
                    });
                    stream.stderr.on('data', (data) => {
                        stderr = data;
                    });
                    stream.on('close', (code, signal) => {
                        let data;
                        if (code != 0) {
                            reject({
                                error,
                                code,
                                signal,
                                errorText: stderr === null || stderr === void 0 ? void 0 : stderr.toString(),
                                output: stdout === null || stdout === void 0 ? void 0 : stdout.toString(),
                                command,
                            });
                        }
                        try {
                            data = stdout.toString();
                            resolve(JSON.parse(data));
                        }
                        catch (error) {
                            resolve(data);
                        }
                    });
                });
            });
        }
        return new Promise((resolve, reject) => {
            if (USERNAME != "syrus4g")
                opts.uid = 1000;
            child_process_1.exec(command, opts, (error, stdout, stderr) => {
                if (error || stderr) {
                    reject({
                        command,
                        error,
                        errorText: stderr.toString(),
                        output: stdout.toString(),
                    });
                }
                try {
                    var data = stdout.toString();
                    resolve(JSON.parse(data));
                }
                catch (error) {
                    resolve(data);
                }
            });
        });
    });
}
exports.OSExecute = OSExecute;
exports.execute = OSExecute;
/**
 * return distance in km between two coordinates points
 * @param coord1 first coordinate to calculate the distance
 * @param coord2 second coordinate to calculate the distance
 */
function distanceBetweenCoordinates(coord1, coord2) {
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
}
exports.distanceBetweenCoordinates = distanceBetweenCoordinates;
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
exports.toJSONReceiver = toJSONReceiver;
/**
 * Fetch application prefix,
 * uses env=SYRUS4G_APP_NAME when available
 * otherwise it builds it from the directory where the app is running
 * @return {*}
 */
function getPrefix() {
    // Use environment name if available
    if (SYRUS4G_APP_NAME)
        return SYRUS4G_APP_NAME;
    // determine from APP_DATA_FOLDER if available
    if (APP_DATA_FOLDER === null || APP_DATA_FOLDER === void 0 ? void 0 : APP_DATA_FOLDER.length) {
        return APP_DATA_FOLDER.split(path.sep).pop();
    }
    // determine from current running directory
    var arr = child_process_1.execSync("pwd")
        .toString()
        .replace("\n", "")
        .split("node_modules/")[0]
        .split("/");
    arr.pop();
    SYRUS4G_APP_NAME = arr.pop();
    console.log("application prefix:", SYRUS4G_APP_NAME);
    return SYRUS4G_APP_NAME;
}
exports.getPrefix = getPrefix;
/**
 * Utility for try/catching promises in one line, avoiding the need for try/catch blocks
 * let [response, error] = $trycatch(await awaitable())
 * @param {Promise<any>} promise
 * @return {*}  {(Promise<[ any | null, Error | null ]>)}
 */
function $trycatch(promise) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = yield promise;
            return [result, null];
        }
        catch (error) {
            console.error(error);
            return [null, error];
        }
    });
}
exports.$trycatch = $trycatch;
// easier to use alias to $trycatch
exports.$to = $trycatch;
/**
 * Utility for throwing errors inside a catch, reduces need for try/catch
 * await awaitable().catch($throw)
 * @param {Error} error
 */
function $throw(error) { throw error; }
exports.$throw = $throw;
/**
 * Sleep Utility
 * await $sleep(10*1000)
 * @param {number} ms
 * @return {*}  {Promise<void>}
 */
function $sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
exports.$sleep = $sleep;
