/**
 * Network module get information about networks and events in ApexOS
 * @module Network
 */
import * as Redis from "ioredis";
import Utils from "./Utils";
import redis_conf from "./redis_conf";

/**
 * Watch the network state change
 * @param callback callback to executed when network state changes
 * @param errorCallback callback to execute in case of error
 */
function onNetworkChange(callback, errorCallback) {
	var redis = new Redis(redis_conf);
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
	var redis = new Redis(redis_conf);
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
		return {};
	}
	var raw: any = await Utils.execute(`ifconfig ${net}`);

	var start = raw.indexOf("inet addr:") + 10;
	var end = raw.indexOf(" ", start);
	if (start > -1) data.ip = raw.substring(start, end);

	start = raw.indexOf("RX bytes:") + 9;
	end = raw.indexOf(" ", start);
	if (start > -1) data["rx_bytes"] = parseInt(raw.substring(start, end));

	start = raw.indexOf("TX bytes:") + 9;
	end = raw.indexOf(" ", start);

	if (start > -1) data["tx_bytes"] = parseInt(raw.substring(start, end));
	data.state = "enable";
	if (data.ip == ""){
		data.ip = null;
		data.state = "disable";
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
