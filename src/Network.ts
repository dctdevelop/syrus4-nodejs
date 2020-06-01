/**
 * Network module get information about networks and events in ApexOS
 * @module Network
 */
import * as Redis from "ioredis";
import Utils from "./Utils";
import redis_conf from "./redis_conf";
var redis = new Redis(redis_conf);
/**
 * Watch the network state change
 * @param callback callback to executed when network state changes
 * @param errorCallback callback to execute in case of error
 */
function onNetworkChange(callback, errorCallback) {
	try {
		var handler = raw => {
			callback(raw);
		};
		redis.subscribe("network/interface");
		redis.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	return {
		unsubscribe: () => {
			redis.off("message", handler);
			redis.unsubscribe("network/interface");
		},
		off: () => {
			redis.off("message", handler);
			redis.unsubscribe("network/interface");
		}
	};
}

/**
 * get the current state of the network of the APEX OS, returns a promise with the info
 */
async function getActiveNetwork() {

	var net = await redis.get("network_interface");
	var data: any = {};
	if (net == "wlan0") {
		data = await Utils.OSExecute("apx-wifi", "state");
	}
	data = Object.assign(data, await getNetworkInfo(net));
	return { network: net, information: data };
}

/**
 * get Network Information about specific network
 * @param net  network that want to know the information valid options are: eth0, ppp0, wlan0
 */
async function getNetworkInfo(net) {
	var data: any = {};
	if (net == "none") {
		return {
			connected: false
		};
	}
	var raw: any = await Utils.execute(`ifconfig ${net}`);
	if(net == "ppp0"){
		var modemInfo:any = await redis.hgetall("modem_information");
		data.imei = modemInfo.IMEI;
		data.operator = modemInfo.OPERATOR;
		data.imsi = modemInfo.SIM_IMSI;
		data.iccid = modemInfo.SIM_ID;
		data.mcc = modemInfo.MCC_MNC.substring(0,3);
		data.mnc = modemInfo.MCC_MNC.substring(3);
	}
	if(net == "wlan0"){
		try {
			var wifiInfo = await Utils.OSExecute("apx-wifi state");
			data = Object.assign(data, wifiInfo);
			data.signal = Number(data.signal);
			delete data.ip
		} catch (error) {
			console.error(error);
		}
	}

	var start = raw.indexOf("inet addr:") + 10;
	var end = raw.indexOf(" ", start);
	if (start > -1) data.ip_address = raw.substring(start, end);

	start = raw.indexOf("RX bytes:") + 9;
	end = raw.indexOf(" ", start);
	if (start > -1) data["rx_bytes"] = parseInt(raw.substring(start, end));

	start = raw.indexOf("TX bytes:") + 9;
	end = raw.indexOf(" ", start);
	if (start > -1) data["tx_bytes"] = parseInt(raw.substring(start, end));

	data.connected = true;
	if (data.ip_address == ""){
		data.ip_address = null;
		data.connected = false;
	}
	return data;
}

/**
 * get network information about all the available networks on APEX OS
 */
async function getNetworks() {
	var nets: any = await Utils.execute(`ifconfig | grep 'Link encap:'`);
	nets = nets.split("\n").map(str => str.split(" ")[0]).filter(str => str);
	var info = {};
	for (const net of nets) {
		info[net] = await getNetworkInfo(net);
	}
	return info;
}

export default {
	onNetworkChange,
	getActiveNetwork,
	getNetworkInfo,
	getNetworks
};
