/**
 * Utils module some utlities in ApexOS
 * @module Utils
 */
import { exec, execSync } from "child_process"
import { userInfo } from "os"
import * as fs from "fs"
import * as path from "path"

import { Client } from 'ssh2'

let { APP_DATA_FOLDER } = process.env
let { SYRUS4G_REMOTE, SYRUS4G_APP_NAME } = process.env

const USERNAME = userInfo().username

function deg2rad(deg: number) {
	return deg * (Math.PI / 180);
}

var __shell_promise : any;
export async function getShell(){
	if(__shell_promise) return await __shell_promise
	const { SYRUS4G_REMOTE_SSH_HOST, SYRUS4G_REMOTE_SSH_PORT,
		SYRUS4G_REMOTE_SSH_USERNAME, SYRUS4G_REMOTE_SSH_PW } = process.env
	console.log("setting up remote shell", {
		SYRUS4G_REMOTE_SSH_HOST,
		SYRUS4G_REMOTE_SSH_PORT,
		SYRUS4G_REMOTE_SSH_USERNAME,
		SYRUS4G_REMOTE_SSH_PW: "*".repeat(SYRUS4G_REMOTE_SSH_PW.length)
	})
	__shell_promise = new Promise((resolve, reject) => {
		let conn = new Client()
		let timeout = setTimeout(reject, 1000 * 20);
		conn.on('ready', () => {
			clearTimeout(timeout)
			console.log('ssh:ready', arguments)
			resolve(conn)
		})
		conn.on('close', () => {
			console.error('ssh:close', arguments)
			__shell_promise = null
		})
		conn.on('end', () => {
			console.error('ssh:end', arguments)
			__shell_promise = null
		})
		conn.on('error', (error) => {
			clearTimeout(timeout)
			console.error('ssh:error', error)
			reject(error)
		})
		conn.connect({
			host: SYRUS4G_REMOTE_SSH_HOST,
			port: parseInt(SYRUS4G_REMOTE_SSH_PORT),
			username: SYRUS4G_REMOTE_SSH_USERNAME,
			password: SYRUS4G_REMOTE_SSH_PW,
		})
	})
	return __shell_promise
}

// TODO: !important remove the root check and uid settings
/**
 * Execute a command using sudo in the shell of the APEXOS and returns a promise with the stdout. Promise is rejected if status code is different than 0
 * @param args arguments to pass to the function to execute
 */
export async function OSExecute(...args:string[]): Promise<any> {
	let command = args.map((x)=>x.trim()).join(" ");
	let opts: any = { timeout: 60000 * 10, maxBuffer: 1024 * 1024 * 5 };

	if (command.startsWith("apx-")) command = `sudo ${command}`

	if (SYRUS4G_REMOTE) {
		let shell = await getShell()
		return new Promise((resolve, reject) => {
			// console.info("ssh:command", command)
			shell.exec(command, (error, stream) => {
				if (error) {
					console.error("ssh:command", {command, error})
					reject({
						command,
						error
					})
					return
				}
				let stdouts: any[], stderrs: any[]
				stream.on('data', (data: Buffer) => {
					stdouts.push(data)
				})
				stream.stderr.on('data', (data: Buffer) => {
					stderrs.push(data)
				})
				stream.on('close', (code: number, signal:number) => {
					let data: any, response: any
					if(code != 0){
						response = {
							error,
							code,
							signal,
							errorText: Buffer.concat(stderrs).toString(),
							output: Buffer.concat(stdouts).toString(),
							command,
						}
						// console.error("ssh:command", response)
						reject(response)
						return
					}
					try{
						data = Buffer.concat(stdouts).toString()
						resolve(JSON.parse(data))
					} catch (error){
						resolve(data)
					}
					// console.log("ssh:command", {command, response: data})
				})
			})
		})
	}
	return new Promise((resolve, reject) => {
		if (USERNAME != "syrus4g") opts.uid = 1000
		exec(command, opts, (error, stdout, stderr) => {
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
			} catch (error) {
				resolve(data);
			}
		});
	});
}

export const execute = OSExecute

export async function uploadFile(path:string, content) {
	if (!SYRUS4G_REMOTE) {
		fs.writeFileSync(path, content)
		return
	}
	let shell = await getShell()
	return new Promise(function(resolve, reject){
		shell.sftp(function(err, sftp){
			if(err) {
				console.log("shell.sftp")
				reject(err)
			}
			sftp.writeFile(path, content, function(err){
				if(err){
					console.log("sftp.writeFile")
					reject(err)
				}
				resolve({ path })
			})
		})
	})
}
/**
 * return distance in km between two coordinates points
 * @param coord1 first coordinate to calculate the distance
 * @param coord2 second coordinate to calculate the distance
 */
export function distanceBetweenCoordinates(coord1, coord2) {
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
export function toJSONReceiver(coord, imei, siteId=1) {
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

/**
 * Fetch application prefix,
 * uses env=SYRUS4G_APP_NAME when available
 * otherwise it builds it from the directory where the app is running
 * @return {*}
 */
export function getPrefix(){
	// Use environment name if available
	if (SYRUS4G_APP_NAME) return SYRUS4G_APP_NAME
	// determine from APP_DATA_FOLDER if available
	if (APP_DATA_FOLDER?.length){
		return APP_DATA_FOLDER.split(path.sep).pop()
	}
	// determine from current running directory
	var arr = execSync("pwd")
		.toString()
		.replace("\n", "")
		.split("node_modules/")[0]
		.split("/");
	arr.pop();
	SYRUS4G_APP_NAME = arr.pop();
	console.log("application prefix:", SYRUS4G_APP_NAME)
	return SYRUS4G_APP_NAME;
}

/**
 * Utility for try/catching promises in one line, avoiding the need for try/catch blocks
 * let [response, error] = $trycatch(await awaitable())
 * @param {Promise<any>} promise
 * @return {*}  {(Promise<[ any | null, Error | null ]>)}
 */
export async function $trycatch(promise:Promise<any>): Promise<[ any | null, Error | null ]>{
	try{
		let result = await promise
		return [result, null]
	}
	catch(error){
		console.error(error)
		return [null, error]
	}
}

// easier to use alias to $trycatch
export const $to = $trycatch

/**
 * Utility for throwing errors inside a catch, reduces need for try/catch
 * await awaitable().catch($throw)
 * @param {Error} error
 */
export function $throw(error: Error): void { throw error }

/**
 * Sleep Utility
 * await $sleep(10*1000)
 * @param {number} ms
 * @return {*}  {Promise<void>}
 */
export function $sleep (ms: number): Promise<void>{
	return new Promise((resolve, reject)=>{
		setTimeout(resolve, ms)
	})
}
