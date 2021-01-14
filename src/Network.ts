/**
 * Network module get information about networks and events in ApexOS
 * @module Network
 */
import { SystemRedisSubscriber as subscriber, SystemRedisClient as redis } from "./Redis";
import * as Utils from "./Utils"

async function IsConnected(net){
	try {
		var raw: any = await Utils.OSExecute(`ip route | grep ${net}`);
	} catch (error) {
		// Error means no text so grep return empty which is means disconnected
		return false;
	}
	return !(raw.length == 0 || raw.indexOf("linkdown") > -1);
}

/**
 * Watch the network state change
 * @param callback callback to executed when network state changes
 * @param errorCallback callback to execute in case of error
 */
function onNetworkChange(callback, errorCallback) {
	try {
		var handler = (channel, raw) => {
			if(channel !== "network/interface") return;
			callback(raw);
		};
		subscriber.subscribe("network/interface");
		subscriber.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	var returnable:any = {
		unsubscribe: () => {
			subscriber.off("message", handler);
		}
	};
	returnable.off = returnable.unsubscribe;
	return returnable;
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
	var raw: any = await Utils.OSExecute(`ifconfig ${net}`);
	if (net == "ppp0") {
		var modemInfo: any = await redis.hgetall("modem_information");
		data.imei = modemInfo.IMEI;
		data.operator = modemInfo.OPERATOR;
		data.imsi = modemInfo.SIM_IMSI;
		data.iccid = modemInfo.SIM_ID;
		data.mcc = modemInfo.MCC_MNC.substring(0, 3);
		data.mnc = modemInfo.MCC_MNC.substring(3);
	}
	if (net == "wlan0") {
		try {
			var wifiInfo = await Utils.OSExecute("apx-wifi state");
			data = Object.assign(data, wifiInfo);
			data.signal = Number(data.signal);
			delete data.ip;
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

	data.connected = await IsConnected(net);
	if (data.ip_address == "") {
		data.ip_address = null;
	}
	return data;
}

/**
 * get network information about all the available networks on APEX OS
 */
async function getNetworks() {
	var nets: any = await Utils.OSExecute(`ifconfig | grep "Link encap:"`);
	nets = nets
		.split("\n")
		.map(str => str.split(" ")[0])
		.filter(str => str);
	var info = {};
	var promises = []
	promises = []
	nets.forEach((net)=>{
		var promise = getNetworkInfo(net);
		promise.then((resp)=>{
			info[net] = resp
		})
		.catch((err)=>{
			throw err;
		});
		promises.push(promise);
	})
	await Promise.all(promises);
	return info;
}

export default {
	onNetworkChange,
	getActiveNetwork,
	getNetworkInfo,
	getNetworks
};
