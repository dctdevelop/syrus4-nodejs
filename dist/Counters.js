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
 * Counters module setup get and set counters from APEX OS
 * @module Counters
 */
const Utils = require("./Utils");
function exists(name) {
    return __awaiter(this, void 0, void 0, function* () {
        var counters = yield Utils.OSExecute(`apx-counter list`);
        return !!counters[`${name}`] || !!counters[`counter_${name}`];
    });
}
function startCounters(config) {
    return __awaiter(this, void 0, void 0, function* () {
        var name = config.name;
        if (!name)
            throw "name is required";
        var shouldSet = config.forceSet || !(yield exists(name));
        Utils.OSExecute(`apx-counter start ${name}`);
        var keys = ["odometer", "ignition_time", "idle_time", "over_speed", "over_rpm", "hard_brakes", "harsh_fwd_acceleration", "rpm_threshold", "speed_threshold", "begin_idle_time"];
        if (shouldSet) {
            for (const key of keys) {
                if (config.key != undefined)
                    Utils.OSExecute(`apx-counter set ${name} ${key.toLowerCase()} ${config[key]}`);
            }
        }
    });
}
function getCounters(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw "name is required";
        return yield Utils.OSExecute(`apx-counter getall ${name}`);
    });
}
function watchCounters(name, cb, cbError, interval = 15) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw "name is required";
        if (!(yield exists(name)))
            throw "counter does not exists";
        try {
            var intervalHandler = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                var results = (yield getCounters(name));
                cb(results);
            }), interval * 1000);
        }
        catch (error) {
            cbError(error);
        }
        return {
            off() {
                clearInterval(intervalHandler);
            },
            unsubscribe() {
                clearInterval(intervalHandler);
            }
        };
    });
}
function stopCounters(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw "name is required";
        yield Utils.OSExecute(`apx-counter start ${name}`);
    });
}
function resetCounters(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw "name is required";
        yield Utils.OSExecute(`apx-counter reset ${name}`);
    });
}
function deleteCounters(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw "name is required";
        yield Utils.OSExecute(`apx-counter delete ${name}`);
    });
}
function listCounters() {
    return __awaiter(this, void 0, void 0, function* () {
        var _counters = yield Utils.OSExecute(`apx-counter list`);
        var counters = {};
        for (const key in _counters) {
            counters[`${key.replace("counter_", "")}`];
        }
        return counters;
    });
}
exports.default = { startCounters, stopCounters, resetCounters, watchCounters, listCounters, deleteCounters };
