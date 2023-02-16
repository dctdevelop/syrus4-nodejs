import Accelerometer from "./Accelerometer"
import Apps from "./Apps"
import * as Bluetooth from "./Bluetooth"
import Counters from "./Counters"
import ECU from "./ECU"
import * as Fatigue from "./Fatigue"
import Geofences from "./Geofences"
import GPS from "./GPS"
import Hotspot from "./Hotspot"
import * as IButton from "./IButton"
import IOS from "./IOS";
import * as Logrotate from "./Logrotate"
import * as Mobile from "./Mobile"
import Network from "./Network"
import * as Redis from "./Redis"
import * as RFID from "./RFID"
import * as Serial from "./Serial"
import System from "./System"
import * as Technoton from "./Technoton"
import * as Temperature from "./Temperature"
import Update from "./Update"
import * as Utils from "./Utils"
import WIFI from "./WIFI"
import * as Windows from "./Windows"
import * as SafeEngine from "./SafeEngine"
import * as PeopleCounter from "./PeopleCounter"

export {
	Accelerometer,
	Apps,
	Bluetooth,
	Counters,
	ECU,
	Fatigue,
	Geofences,
	GPS,
	Hotspot,
	IButton,
	IOS,
	Logrotate,
	Mobile,
	Network,
	Redis,
	RFID,
	Serial,
	System,
	SafeEngine,
	PeopleCounter,
	Technoton,
	Temperature,
	Update,
	Utils,
	WIFI,
	Windows,
};


Geofences.getAll({namespace : 'test_namespace'});

Geofences.watchGeofences(event => {
	console.log('watchGeofences:', event);
}, console.error);

Geofences.watchGroups(event => {
	console.log('watchGroups:', event);
}, console.error);