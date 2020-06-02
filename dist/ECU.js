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
/**
 * ECU module get information about EcU monitor and vehicle in ApexOS
 * @module ECU
 */
const Redis_1 = require("./Redis");
/**
 * ECU PARAM LIST from the ecu monitor
 */
const ECU_PARAM_LIST = {
    "f001_1.5": {
        id: "f001_1.5",
        syruslang_param: "abs_active",
        param_name: "ANTI-LOCK BRAKING (ABS) ACTIVE",
        units: "Count",
        range: "0 to 3",
        pgn: "f001",
        start_position: "1.5"
    },
    "fee4_3.1": {
        id: "fee4_3.1",
        syruslang_param: "ac_high_pressure_fan_switch",
        param_name: "A/C HIGH PRESSURE FAN SWITCH",
        units: "Count",
        range: "0 to 3",
        pgn: "fee4",
        start_position: "3.1"
    },
    "f001_4.7": {
        id: "f001_4.7",
        syruslang_param: "accel_enable_switch",
        param_name: "REMOTE ACCELERATOR ENABLE SWITCH",
        units: "Count",
        range: "0 to 3",
        pgn: "f001",
        start_position: "4.7"
    },
    f003_2: {
        id: "f003_2",
        syruslang_param: "accel_pedal_position",
        param_name: "ACCELERATOR PEDAL POSITION 1",
        units: "Percentage",
        range: "%",
        pgn: "f003",
        start_position: "2"
    },
    f003_4: {
        id: "f003_4",
        syruslang_param: "remote_accel_pedal_position",
        param_name: "REMOTE ACCELERATOR PEDAL POSITION",
        units: "Percentage",
        range: "%",
        pgn: "f003",
        start_position: "4"
    },
    f004_3: {
        id: "f004_3",
        syruslang_param: "actual_engine_torque",
        param_name: "ACTUAL ENGINE - PERCENT TORQUE",
        units: "Percentage",
        range: "%",
        pgn: "f004",
        start_position: "3"
    },
    "fd3e_1-2": {
        id: "fd3e_1-2",
        syruslang_param: "aftmt_catalyst_intake_gas_temp",
        param_name: "AFTERTREATMENT 1 SCR CATALYST INTAKE GAS TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fd3e",
        start_position: "1-2"
    },
    "fd3e_4-5": {
        id: "fd3e_4-5",
        syruslang_param: "aftmt_catalyst_outlet_gas_temp",
        param_name: "AFTERTREATMENT 1 SCR CATALYST OUTLET GAS TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fd3e",
        start_position: "4-5"
    },
    fe56_1: {
        id: "fe56_1",
        syruslang_param: "aftmt_def_level",
        param_name: "AFTERTREATMENT 1 DIESEL EXHAUST FLUID TANK 1 LEVEL",
        units: "Percentage",
        range: "%",
        pgn: "fe56",
        start_position: "1"
    },
    "fe56_5.6": {
        id: "fe56_5.6",
        syruslang_param: "aftmt_def_low_level",
        param_name: "AFTERTREATMENT 1 DIESEL EXHAUST FLUID TANK 1 LOW LEVEL INDICATOR",
        units: "Count",
        range: "0 to 3",
        pgn: "fe56",
        start_position: "5.6"
    },
    fe56_2: {
        id: "fe56_2",
        syruslang_param: "aftmt_def_temp",
        param_name: "AFTERTREATMENT 1 DIESEL EXHAUST FLUID TANK 1 TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fe56",
        start_position: "2"
    },
    "fd20_1-2": {
        id: "fd20_1-2",
        syruslang_param: "aftmt_doc_intake_gas_temp",
        param_name: "AFTERTREATMENT 1 DIESEL OXIDATION CATALYST INTAKE GAS TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fd20",
        start_position: "1-2"
    },
    "fdb2_5-6": {
        id: "fdb2_5-6",
        syruslang_param: "aftmt_dpf_diff_pressure",
        param_name: "AFTERTREATMENT 1 DIESEL PARTICULATE FILTER DIFFERENTIAL PRESSURE",
        units: "Pressure",
        range: "kPa",
        pgn: "fdb2",
        start_position: "5-6"
    },
    "fdb4_3-4": {
        id: "fdb4_3-4",
        syruslang_param: "aftmt_dpf_intake_gas_temp",
        param_name: "AFTERTREATMENT 1 DIESEL PARTICULATE FILTER INTAKE GAS TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fdb4",
        start_position: "3-4"
    },
    "fdb3_3-4": {
        id: "fdb3_3-4",
        syruslang_param: "aftmt_dpf_outlet_gas_temp",
        param_name: "AFTERTREATMENT 1 DIESEL PARTICULATE FILTER OUTLET GAS TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fdb3",
        start_position: "3-4"
    },
    fd7b_7: {
        id: "fd7b_7",
        syruslang_param: "aftmt_dpf_soot_load_threshold",
        param_name: "AFTERTREATMENT 1 DIESEL PARTICULATE FILTER SOOT LOAD REGENERATION THRESHOLD",
        units: "Percentage",
        range: "%",
        pgn: "fd7b",
        start_position: "7"
    },
    "f00e_1-2": {
        id: "f00e_1-2",
        syruslang_param: "aftmt_intake_nox",
        param_name: "AFTERTREATMENT 1 INTAKE NOX",
        units: "Parts per million",
        range: "ppm",
        pgn: "f00e",
        start_position: "1-2"
    },
    "f00f_1-2": {
        id: "f00f_1-2",
        syruslang_param: "aftmt_outlet_nox",
        param_name: "AFTERTREATMENT 1 OUTLET NOX",
        units: "Parts per million",
        range: "ppm",
        pgn: "f00f",
        start_position: "1-2"
    },
    "fd9f_8.5": {
        id: "fd9f_8.5",
        syruslang_param: "aftmt_purge_air_actuator",
        param_name: "AFTERTREATMENT 1 PURGE AIR ACTUATOR",
        units: "Count",
        range: "0 to 3",
        pgn: "fd9f",
        start_position: "8.5"
    },
    "fef5_4-5": {
        id: "fef5_4-5",
        syruslang_param: "ambient_air_temp",
        param_name: "AMBIENT AIR TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fef5",
        start_position: "4-5"
    },
    feea_1: { id: "feea_1", "SYRUSLANG PARAM": "axle_location", PARAM_NAME: "AXLE LOCATION", Units: "Count", Range: "0 to 255", PGN: "feea", START_POSITION: "1" },
    "fef7_5-6": {
        id: "fef7_5-6",
        syruslang_param: "battery_power",
        param_name: "BATTERY POTENTIAL / POWER INPUT 1",
        units: "Electrical voltage",
        range: "V",
        pgn: "fef7",
        start_position: "5-6"
    },
    f001_2: { id: "f001_2", "SYRUSLANG PARAM": "brake_pedal", PARAM_NAME: "BRAKE PEDAL POSITION", Units: "Percentage", Range: "%", PGN: "f001", START_POSITION: "2" },
    "fef1_4.5": { id: "fef1_4.5", "SYRUSLANG PARAM": "brake_switch", PARAM_NAME: "BRAKE SWITCH", Units: "Count ", Range: "0 to 3", PGN: "fef1", START_POSITION: "4.5" },
    "fef1_4.7": { id: "fef1_4.7", "SYRUSLANG PARAM": "clutch_switch", PARAM_NAME: "CLUTCH SWITCH", Units: "Count ", Range: "0 to 3", PGN: "fef1", START_POSITION: "4.7" },
    feef_8: { id: "feef_8", "SYRUSLANG PARAM": "coolant_level", PARAM_NAME: "ENGINE COOLANT LEVEL", Units: "Percentage", Range: "%", PGN: "feef", START_POSITION: "8" },
    feef_7: { id: "feef_7", "SYRUSLANG PARAM": "coolant_pressure", PARAM_NAME: "ENGINE COOLANT PRESSURE", Units: "Pressure", Range: "kPa", PGN: "feef", START_POSITION: "7" },
    feee_1: { id: "feee_1", "SYRUSLANG PARAM": "coolant_temp", PARAM_NAME: "ENGINE COOLANT TEMPERATURE", Units: "Temperature", Range: "C", PGN: "feee", START_POSITION: "1" },
    "feef_5-6": {
        id: "feef_5-6",
        syruslang_param: "crankcase_pressure",
        param_name: "ENGINE CRANKCASE PRESSURE",
        units: "Pressure",
        range: "kPa",
        pgn: "feef",
        start_position: "5-6"
    },
    fef1_6: {
        id: "fef1_6",
        syruslang_param: "cruise_control_set_speed",
        param_name: "CRUISE CONTROL SET SPEED",
        units: "Velocity, linear",
        range: "km/h",
        pgn: "fef1",
        start_position: "6"
    },
    "fef1_7.6": {
        id: "fef1_7.6",
        syruslang_param: "cruise_control_states",
        param_name: "CRUISE CONTROL STATES",
        units: "Count",
        range: "0 to 7",
        pgn: "fef1",
        start_position: "7.6"
    },
    f004_2: {
        id: "f004_2",
        syruslang_param: "demand_engine_torque",
        param_name: "DRIVER'S DEMAND ENGINE - PERCENT TORQUE",
        units: "Percentage",
        range: "%",
        pgn: "f004",
        start_position: "2"
    },
    "fec0_2-3": { id: "fec0_2-3", "SYRUSLANG PARAM": "distance_service", PARAM_NAME: "SERVICE DISTANCE", Units: "Distance, km", Range: "km", PGN: "fec0", START_POSITION: "2-3" },
    "fee0_5-8": {
        id: "fee0_5-8",
        syruslang_param: "distance_total",
        param_name: "TOTAL VEHICLE DISTANCE",
        units: "Distance, km",
        range: "km",
        pgn: "fee0",
        start_position: "5-8"
    },
    "fec1_1-4": {
        id: "fec1_1-4",
        syruslang_param: "distance_total_high_res",
        param_name: "HIGH RESOLUTION TOTAL VEHICLE DISTANCE",
        units: "Distance, km",
        range: "km",
        pgn: "fec1",
        start_position: "1-4"
    },
    "fee0_1-4": { id: "fee0_1-4", "SYRUSLANG PARAM": "distance_trip", PARAM_NAME: "TRIP DISTACE", Units: "Distance, km", Range: "km", PGN: "fee0", START_POSITION: "1-4" },
    "fec1_5-8": {
        id: "fec1_5-8",
        syruslang_param: "distance_trip_high_res",
        param_name: "HIGH RESOLUTION TRIP DISTANCE",
        units: "Distance, km",
        range: "km",
        pgn: "fec1",
        start_position: "5-8"
    },
    "fd7c_2.3": {
        id: "fd7c_2.3",
        syruslang_param: "dpf_active_regen_status",
        param_name: "DIESEL PARTICULATE FILTER ACTIVE REGENERATION STATUS",
        units: "Count",
        range: "0 to 3",
        pgn: "fd7c",
        start_position: "2.3"
    },
    "fd8c_1-2": {
        id: "fd8c_1-2",
        syruslang_param: "dpf_intake_pressure",
        param_name: "DIESEL PARTICULATE FILTER INTAKE PRESSURE 1",
        units: "Pressure",
        range: "kPa",
        pgn: "fd8c",
        start_position: "1-2"
    },
    fd7b_1: {
        id: "fd7b_1",
        syruslang_param: "dpf_soot_load",
        param_name: "DIESEL PARTICULATE FILTER 1 SOOT LOAD PERCENT",
        units: "Percentage",
        range: "%",
        pgn: "fd7b",
        start_position: "1"
    },
    "***_***": { id: "***_***", "SYRUSLANG PARAM": "dtc", PARAM_NAME: "ACTIVE DIAGNOSTIC TROUBLE CODES ", Units: "", Range: "", PGN: "***", START_POSITION: "***" },
    f003_3: {
        id: "f003_3",
        syruslang_param: "engine_load",
        param_name: "ENGINE PERCENT LOAD AT CURRENT SPEED",
        units: "Percentage",
        range: "%",
        pgn: "f003",
        start_position: "3"
    },
    "fe92_2-3": {
        id: "fe92_2-3",
        syruslang_param: "exhaust_gas_pressure",
        param_name: "ENGINE EXHAUST GAS PRESSURE",
        units: "Pressure",
        range: "kPa",
        pgn: "fe92",
        start_position: "2-3"
    },
    "fea4_5-6": {
        id: "fea4_5-6",
        syruslang_param: "exhaust_gas_recirculation_diff_pressure",
        param_name: "ENGINE EXHAUST GAS RECIRCULATION 1 DIFFERENTIAL PRESSURE",
        units: "Presure",
        range: "kPa",
        pgn: "fea4",
        start_position: "5-6"
    },
    "f00a_1-2": {
        id: "f00a_1-2",
        syruslang_param: "exhaust_gas_recirculation_mass_flow_rate",
        param_name: "ENGINE EXHAUST GAS RECIRCULATION 1 (EGR1) MASS FLOW RATE",
        units: "Flow rate, gaseous",
        range: "kg/h",
        pgn: "f00a",
        start_position: "1-2"
    },
    "fea4_7-8": {
        id: "fea4_7-8",
        syruslang_param: "exhaust_gas_recirculation_temp",
        param_name: "ENGINE EXHAUST GAS RECIRCULATION 1 TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fea4",
        start_position: "7-8"
    },
    "fdd5_5-6": {
        id: "fdd5_5-6",
        syruslang_param: "exhaust_gas_recirculation_valve_control",
        param_name: "ENGINE EXHAUST GAS RECIRCULATION 1 VALVE CONTROL",
        units: "Percentage",
        range: "%",
        pgn: "fdd5",
        start_position: "5-6"
    },
    "fd94_1-2": {
        id: "fd94_1-2",
        syruslang_param: "exhaust_gas_recirculation_valve_position",
        param_name: "ENGINE EXHAUST GAS RECIRCULATION 1 VALVE POSITION",
        units: "Percentage",
        range: "%",
        pgn: "fd94",
        start_position: "1-2"
    },
    "fef6_6-7": {
        id: "fef6_6-7",
        syruslang_param: "exhaust_gas_temp",
        param_name: "ENGINE EXHAUST GAS TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fef6",
        start_position: "6-7"
    },
    "febd_2.1": { id: "febd_2.1", "SYRUSLANG PARAM": "fan_drive_state", PARAM_NAME: "FAN DRIVE STATE", Units: "Count ", Range: "0 to 15", PGN: "febd", START_POSITION: "2.1" },
    "fedc_1-4": {
        id: "fedc_1-4",
        syruslang_param: "fuel_idle",
        param_name: "ENGINE TOTAL IDLE FUEL USED",
        units: "Fuel used, liquid",
        range: "L",
        pgn: "fedc",
        start_position: "1-4"
    },
    "fef2_3-4": {
        id: "fef2_3-4",
        syruslang_param: "fuel_ins_economy",
        param_name: "ENGINE INSTANTANEOUS FUEL ECONOMY",
        units: "Economy, liquid",
        range: "km/L",
        pgn: "fef2",
        start_position: "3-4"
    },
    fefc_2: { id: "fefc_2", "SYRUSLANG PARAM": "fuel_level", PARAM_NAME: "FUEL LEVEL 1", Units: "Percentage", Range: "%", PGN: "fefc", START_POSITION: "2" },
    "fef2_1-2": { id: "fef2_1-2", "SYRUSLANG PARAM": "fuel_rate", PARAM_NAME: "ENGINE FUEL RATE", Units: "Flow rate, liquid", Range: "L/h", PGN: "fef2", start_position: "1-2" },
    feee_2: { id: "feee_2", "SYRUSLANG PARAM": "fuel_temp", PARAM_NAME: "ENGINE FUEL TEMPERATURE 1", Units: "Temperature", Range: "C", PGN: "feee", START_POSITION: "2" },
    "fee9_5-8": {
        id: "fee9_5-8",
        syruslang_param: "fuel_total",
        param_name: "ENGINE TOTAL FUEL USED",
        units: "Fuel used, liquid",
        range: "L",
        pgn: "fee9",
        start_position: "5-8"
    },
    "fee9_1-4": { id: "fee9_1-4", "SYRUSLANG PARAM": "fuel_trip", PARAM_NAME: "ENGINE TRIP FUEL", Units: "Fuel used, liquid", Range: "L", PGN: "fee9", START_POSITION: "1-4" },
    "fedc_5-8": { id: "fedc_5-8", "SYRUSLANG PARAM": "hours_idle", PARAM_NAME: "ENGINE TOTAL IDLE HOURS", Units: "Time, hr", Range: "hr", PGN: "fedc", START_POSITION: "5-8" },
    "fee5_1-4": {
        id: "fee5_1-4",
        syruslang_param: "hours_total",
        param_name: "ENGINE TOTAL HOURS OF OPERATION",
        units: "Time, hr",
        range: "hr",
        pgn: "fee5",
        start_position: "1-4"
    },
    fe68_3: { id: "fe68_3", "SYRUSLANG PARAM": "hydraulic_oil_level", PARAM_NAME: "HYDRAULIC OIL LEVEL", Units: "Percentage", Range: "%", PGN: "fe68", START_POSITION: "3" },
    "f008_1-2": { id: "f008_1-2", "SYRUSLANG PARAM": "hydraulic_pressure", PARAM_NAME: "HYDRAULIC PRESSURE", Units: "Pressure", Range: "kPa", PGN: "f008", START_POSITION: "1-2" },
    fe68_1: { id: "fe68_1", "SYRUSLANG PARAM": "hydraulic_temp", PARAM_NAME: "HYDRAULIC TEMPERATURE", Units: "Temperature", Range: "C", PGN: "fe68", START_POSITION: "1" },
    "f00a_3-4": {
        id: "f00a_3-4",
        syruslang_param: "intake_air_mass_flow_rate",
        param_name: "ENGINE INTAKE AIR MASS FLOW RATE",
        units: "Flow rate, gaseous",
        range: "kg/h",
        pgn: "f00a",
        start_position: "3-4"
    },
    fef6_2: {
        id: "fef6_2",
        syruslang_param: "intake_manif_pressure",
        param_name: "ENGINE INTAKE MANIFOLD #1 PRESSURE",
        units: "Pressure",
        range: "kPa",
        pgn: "fef6",
        start_position: "2"
    },
    fef6_3: {
        id: "fef6_3",
        syruslang_param: "intake_manif_temp",
        param_name: "ENGINE INTAKE MANIFOLD 1 TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fef6",
        start_position: "3"
    },
    fedf_1: {
        id: "fedf_1",
        syruslang_param: "nominal_friction_torque",
        param_name: "NOMINAL FRICTION - PERCENT TORQUE",
        units: "Percentage",
        range: "%",
        pgn: "fedf",
        start_position: "1"
    },
    feef_3: { id: "feef_3", "SYRUSLANG PARAM": "oil_level", PARAM_NAME: "ENGINE OIL LEVEL", Units: "Percentage", Range: "%", PGN: "feef", START_POSITION: "3" },
    feef_4: { id: "feef_4", "SYRUSLANG PARAM": "oil_pressure", PARAM_NAME: "ENGINE OIL PRESSURE", Units: "Pressure", Range: "kPa", PGN: "feef", START_POSITION: "4" },
    "feee_3-4": { id: "feee_3-4", "SYRUSLANG PARAM": "oil_temp", PARAM_NAME: "ENGINE OIL TEMPERATURE 1", Units: "Temperature", Range: "C", PGN: "feee", START_POSITION: "3-4" },
    "fef1_1.3": {
        id: "fef1_1.3",
        syruslang_param: "parking_brake_switch",
        param_name: "PARKING BRAKE SWITCH",
        units: "Count",
        range: "0 to 3",
        pgn: "fef1",
        start_position: "1.3"
    },
    "fef0_6.1": {
        id: "fef0_6.1",
        syruslang_param: "pto_enable_switch",
        param_name: "ENGINE PTO GOVERNOR ENABLE SWITCH",
        units: "Count",
        range: "0 to 3",
        pgn: "fef0",
        start_position: "6.1"
    },
    "fef0_6.3": {
        id: "fef0_6.3",
        syruslang_param: "pto_speed_control_switch",
        param_name: "ENGINE REMOTE PTO GOVERNOR PREPROGRAMMED SPEED CONTROL SWITCH",
        units: "Count",
        range: "0 to 3",
        pgn: "fef0",
        start_position: "6.3"
    },
    "fef1_7.1": { id: "fef1_7.1", "SYRUSLANG PARAM": "pto_state", PARAM_NAME: "PTO GOVERNOR STATE", Units: "Count", Range: "0 to 31", PGN: "fef1", START_POSITION: "7.1" },
    "fee3_20-21": {
        id: "fee3_20-21",
        syruslang_param: "reference_torque",
        param_name: "ENGINE REFERENCE TORQUE (ENGINE CONFIGURATION)",
        units: "Torque",
        range: "Nm",
        pgn: "fee3",
        start_position: "20-21"
    },
    "f000_1.5": {
        id: "f000_1.5",
        syruslang_param: "retarder_brake_assist",
        param_name: "RETARDER ENABLE - BRAKE ASSIST SWITCH",
        units: "Count",
        range: "0 to 3",
        pgn: "f000",
        start_position: "1.5"
    },
    "f004_4-5": { id: "f004_4-5", "SYRUSLANG PARAM": "rpm", PARAM_NAME: "ENGINE SPEED", Units: "Velocity, rotational", Range: "rpm", PGN: "f004", START_POSITION: "4-5" },
    "e000_4.7": { id: "e000_4.7", "SYRUSLANG PARAM": "seat_belt", PARAM_NAME: "SEAT BELT SWITCH", Units: "Count", Range: "0 to 3", PGN: "e000", START_POSITION: "4.7" },
    "fef1_2-3": {
        id: "fef1_2-3",
        syruslang_param: "speed",
        param_name: "WHEEL-BASED VEHICLE SPEED",
        units: "Velocity, linear",
        range: "km/h",
        pgn: "fef1",
        start_position: "2-3"
    },
    fef4_1: { id: "fef4_1", "SYRUSLANG PARAM": "tire_location", PARAM_NAME: "TIRE LOCATION", Units: "Count", Range: "0 to 255", PGN: "fef4", START_POSITION: "1" },
    fef4_2: { id: "fef4_2", "SYRUSLANG PARAM": "tires_psi", PARAM_NAME: "TIRE PRESSURE", Units: "Pressure", Range: "kPa", PGN: "fef4", START_POSITION: "2" },
    "fef4_3-4": { i_: "fef4_3-4", "SYRUSLANG PARAM": "tires_tmp", PARAM_NAME: "TIRE TEMPERATURE", Units: "Temperature", Range: "C", PGN: "fef4", start_position: "3-4" },
    "feb1_1-4": { id: "feb1_1-4", "SYRUSLANG PARAM": "total_ecu_run_time", PARAM_NAME: "TOTAL ECU RUN TIME", Units: "Time, hr", Range: "hr", PGN: "feb1", start_position: "1-4" },
    fef8_2: { id: "fef8_2", "SYRUSLANG PARAM": "trans_oil_level", PARAM_NAME: "TRANSMISSION OIL LEVEL", Units: "Percentage", Range: "%", PGN: "fef8", start_position: "2" },
    fef8_4: { id: "fef8_4", "SYRUSLANG PARAM": "trans_oil_pressure", PARAM_NAME: "TRANSMISSION OIL PRESSURE", Units: "Pressure", Range: "kPa", PGN: "fef8", START_POSItio_: "4" },
    "fef8_5-6": {
        id: "fef8_5-6",
        syruslang_param: "trans_oil_temp",
        param_name: "TRANSMISSION OIL TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fef8",
        start_position: "5-6"
    },
    "fe99_1-2": {
        id: "fe99_1-2",
        syruslang_param: "turbo_compressor_intake_pressure",
        param_name: "ENGINE TURBOCHARGER 1 COMPRESSOR INTAKE PRESSURE",
        units: "Pressure",
        range: "kPa",
        pgn: "fe99",
        start_position: "1-2"
    },
    "fe9a_1-2": {
        id: "fe9a_1-2",
        syruslang_param: "turbo_compressor_intake_temp",
        param_name: "ENGINE TURBOCHARGER 1 COMPRESSOR INTAKE TEMPERATURE",
        units: "Temperature",
        range: "C",
        pgn: "fe9a",
        start_position: "1-2"
    },
    "fedd_2-3": {
        id: "fedd_2-3",
        syruslang_param: "turbo_speed",
        param_name: "ENGINE TURBOCHARGER 1 SPEED",
        units: "Velocity, rotational",
        range: "rpm",
        pgn: "fedd",
        start_position: "2-3"
    },
    fda3_3: {
        id: "fda3_3",
        syruslang_param: "vgt_actuator",
        param_name: "ENGINE VARIABLE GEOMETRY TURBOCHARGER ACTUATOR #1",
        units: "Percentage",
        range: "%",
        pgn: "fda3",
        start_position: "3"
    },
    fdd5_8: {
        id: "fdd5_8",
        syruslang_param: "vgt_actuator_position",
        param_name: "ENGINE VARIABLE GEOMETRY TURBOCHARGER 1 ACTUATOR POSITION",
        units: "Percentage",
        range: "%",
        pgn: "fdd5",
        start_position: "8"
    },
    "fdd5_7.3": {
        id: "fdd5_7.3",
        syruslang_param: "vgt_control_mode",
        param_name: "ENGINE VARIABLE GEOMETRY TURBOCHARGER 1 CONTROL MODE",
        units: "Count",
        range: "0 to 3",
        pgn: "fdd5",
        start_position: "7.3"
    },
    "feff_1.1": { id: "feff_1.1", "SYRUSLANG PARAM": "water_in_fuel", PARAM_NAME: "WATER IN FUEL INDICATOR", Units: "Count", Range: "0 to 3", PGN: "feff", STArt_positio_: "1.1" },
    "feea_2-3": { i_: "feea_2-3", "SYRUSLANG PARAM": "weight_axle", PARAM_NAME: "AXLE WEIGHT", Units: "Mass, cargo", Range: "kg", PGN: "feea", START_POSITION: "2-3" },
    "feea_6-7": { id: "feea_6-7", "SYRUSLANG PARAM": "weight_cargo", PARAM_NAME: "CARGO WEIGHT", Units: "Mass, cargo", Range: "kg", PGN: "feea", start_positio_: "6-7" },
    "fe70_3-4": {
        id: "fe70_3-4",
        syruslang_param: "weight_gross_combination",
        param_name: "GROSS COMBINATION VEHICLE WEIGHT",
        units: "Mass, cargo",
        range: "kg",
        pgn: "fe70",
        start_position: "3-4"
    },
    "fe70_1-2": {
        id: "fe70_1-2",
        syruslang_param: "weight_powered_vehicle",
        param_name: "POWERED VEHICLE WEIGHT",
        units: "Mass, cargo",
        range: "kg",
        pgn: "fe70",
        start_positio_: "1-2"
    },
    "feea_4-5": { id: "feea_4-5", "SYRUSLANG PARAM": "weight_trailer", PARAM_NAME: "TRAILER WEIGHT", Units: "Mass, cargo", Range: "kg", PGN: "feea", START_POSITION: "4-5" }
};
/**
 *  allows to subscribe for ECU parameter changes
 * @param cb calbback to execute when new ECU data arrives
 * @param errorCallback errorCallback when something wrong goes with the subscription
 */
function watchECUParams(cb, errorCallback) {
    try {
        var handler = (channel, raw) => {
            if (channel != "ecumonitor/parameters")
                return;
            var ecu_values = {};
            raw.split("&").map(param => {
                var [key, value] = param.split("=");
                if (ECU_PARAM_LIST[key]) {
                    ecu_values[ECU_PARAM_LIST[key].syruslang_param] = value;
                }
                else {
                    ecu_values[key] = value;
                }
            });
            cb(ecu_values);
        };
        Redis_1.redisSubscriber.subscribe("ecumonitor/parameters");
        Redis_1.redisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    var returnable = {
        unsubscribe: () => {
            Redis_1.redisSubscriber.off("message", handler);
        }
    };
    returnable.off = returnable.unsubscribe;
    return returnable;
}
/**
 * Get all the most recent data from ECU parameters
 */
function getECUParams() {
    return __awaiter(this, void 0, void 0, function* () {
        var ecu_params = yield Redis_1.redisClient.hgetall("ecumonitor_parameters");
        var ecu_values = {};
        for (const key in ecu_params) {
            const value = ecu_params[key];
            if (ECU_PARAM_LIST[key]) {
                ecu_values[ECU_PARAM_LIST[key].syruslang_param] = value;
            }
            else {
                ecu_values[key] = value;
            }
        }
        return ecu_values;
    });
}
exports.default = { ECU_PARAM_LIST, getECUParams, watchECUParams };
