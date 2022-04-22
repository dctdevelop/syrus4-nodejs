"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
exports.WIFI = exports.Utils = exports.Update = exports.Temperature = exports.System = exports.Serial = exports.Redis = exports.Network = exports.Mobile = exports.IOS = exports.RFID = exports.IButton = exports.Hotspot = exports.GPS = exports.Geofences = exports.Fatigue = exports.ECU = exports.Counters = exports.Bluetooth = exports.Apps = exports.Accelerometer = void 0;
=======
exports.WIFI = exports.Utils = exports.Update = exports.Temperature = exports.Technoton = exports.System = exports.Serial = exports.RFID = exports.Redis = exports.Network = exports.Mobile = exports.IOS = exports.IButton = exports.Hotspot = exports.GPS = exports.Geofences = exports.Fatigue = exports.ECU = exports.Counters = exports.Bluetooth = exports.Apps = exports.Accelerometer = void 0;
>>>>>>> feature/serial-technoton
const Accelerometer_1 = require("./Accelerometer");
exports.Accelerometer = Accelerometer_1.default;
const Apps_1 = require("./Apps");
exports.Apps = Apps_1.default;
const Bluetooth = require("./Bluetooth");
exports.Bluetooth = Bluetooth;
const Counters_1 = require("./Counters");
exports.Counters = Counters_1.default;
const ECU_1 = require("./ECU");
exports.ECU = ECU_1.default;
const Fatigue = require("./Fatigue");
exports.Fatigue = Fatigue;
const Geofences_1 = require("./Geofences");
exports.Geofences = Geofences_1.default;
const GPS_1 = require("./GPS");
exports.GPS = GPS_1.default;
const Hotspot_1 = require("./Hotspot");
exports.Hotspot = Hotspot_1.default;
const IButton = require("./IButton");
exports.IButton = IButton;
const RFID = require("./RFID");
exports.RFID = RFID;
const IOS_1 = require("./IOS");
exports.IOS = IOS_1.default;
const Mobile = require("./Mobile");
exports.Mobile = Mobile;
const Network_1 = require("./Network");
exports.Network = Network_1.default;
const Redis = require("./Redis");
exports.Redis = Redis;
const RFID = require("./RFID");
exports.RFID = RFID;
const Serial = require("./Serial");
exports.Serial = Serial;
const System_1 = require("./System");
exports.System = System_1.default;
const Technoton = require("./Technoton");
exports.Technoton = Technoton;
const Temperature = require("./Temperature");
exports.Temperature = Temperature;
const Update_1 = require("./Update");
exports.Update = Update_1.default;
const Utils = require("./Utils");
exports.Utils = Utils;
const WIFI_1 = require("./WIFI");
exports.WIFI = WIFI_1.default;
/**
Technoton.onFuelEvent(event => {
    console.log('onFuelEvent:', event);
}, console.error );*/ 
