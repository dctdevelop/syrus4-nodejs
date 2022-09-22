"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIFI = exports.Utils = exports.Update = exports.Temperature = exports.Technoton = exports.System = exports.Serial = exports.RFID = exports.Redis = exports.Network = exports.Mobile = exports.Logrotate = exports.IOS = exports.IButton = exports.Hotspot = exports.GPS = exports.Geofences = exports.Fatigue = exports.ECU = exports.Counters = exports.Bluetooth = exports.Apps = exports.Accelerometer = void 0;
const Accelerometer_1 = __importDefault(require("./Accelerometer"));
exports.Accelerometer = Accelerometer_1.default;
const Apps_1 = __importDefault(require("./Apps"));
exports.Apps = Apps_1.default;
const Bluetooth = __importStar(require("./Bluetooth"));
exports.Bluetooth = Bluetooth;
const Counters_1 = __importDefault(require("./Counters"));
exports.Counters = Counters_1.default;
const ECU_1 = __importDefault(require("./ECU"));
exports.ECU = ECU_1.default;
const Fatigue = __importStar(require("./Fatigue"));
exports.Fatigue = Fatigue;
const Geofences_1 = __importDefault(require("./Geofences"));
exports.Geofences = Geofences_1.default;
const GPS_1 = __importDefault(require("./GPS"));
exports.GPS = GPS_1.default;
const Hotspot_1 = __importDefault(require("./Hotspot"));
exports.Hotspot = Hotspot_1.default;
const IButton = __importStar(require("./IButton"));
exports.IButton = IButton;
const IOS_1 = __importDefault(require("./IOS"));
exports.IOS = IOS_1.default;
const Logrotate = __importStar(require("./Logrotate"));
exports.Logrotate = Logrotate;
const Mobile = __importStar(require("./Mobile"));
exports.Mobile = Mobile;
const Network_1 = __importDefault(require("./Network"));
exports.Network = Network_1.default;
const Redis = __importStar(require("./Redis"));
exports.Redis = Redis;
const RFID = __importStar(require("./RFID"));
exports.RFID = RFID;
const Serial = __importStar(require("./Serial"));
exports.Serial = Serial;
const System_1 = __importDefault(require("./System"));
exports.System = System_1.default;
const Technoton = __importStar(require("./Technoton"));
exports.Technoton = Technoton;
const Temperature = __importStar(require("./Temperature"));
exports.Temperature = Temperature;
const Update_1 = __importDefault(require("./Update"));
exports.Update = Update_1.default;
const Utils = __importStar(require("./Utils"));
exports.Utils = Utils;
const WIFI_1 = __importDefault(require("./WIFI"));
exports.WIFI = WIFI_1.default;
Fatigue.onFatigueEvent(event => {
    console.log('onFatigueEvent:', event);
}, console.error);
