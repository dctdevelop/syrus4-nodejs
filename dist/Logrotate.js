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
exports.onLogEvent = exports.deleteConfiguration = exports.setConfiguration = exports.getStatus = exports.getConfiguration = exports.listConfigurations = void 0;
/**
 * Counters module setup get and set counters from APEX OS
 * @module Logrotate
 */
const Utils = require("./Utils");
const Redis_1 = require("./Redis");
function listConfigurations() {
    return __awaiter(this, void 0, void 0, function* () {
        return JSON.parse(yield Utils.OSExecute(`apx-logrotate read --name=all`));
    });
}
exports.listConfigurations = listConfigurations;
function getConfiguration(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw "Name is required";
        return JSON.parse(yield Utils.OSExecute(`apx-logrotate read --name=${name}`));
    });
}
exports.getConfiguration = getConfiguration;
function getStatus(name = 'all') {
    return __awaiter(this, void 0, void 0, function* () {
        return JSON.parse(yield Utils.OSExecute(`apx-logrotate status --name=${name}`));
    });
}
exports.getStatus = getStatus;
function setConfiguration(name, path, rotate = '1D', size = '100MB', compress = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name)
            throw "Name is required";
        if (!path)
            throw "Path is required";
        const rotation = rotate.slice(0, -1);
        const rotate_size = size.slice(0, -1);
        let period = rotate.slice(1);
        switch (period) {
            case 'H':
                period = 'hourly';
                break;
            case 'D':
                period = 'daily';
                break;
            case 'W':
                period = 'weekly';
                break;
            case 'Y':
                period = 'yearly';
                break;
            default:
                break;
        }
        let response = undefined;
        try {
            response = yield Utils.OSExecute(`apx-logrotate configure --name=${name} --path=${path} --rotate=${rotation} --size=${rotate_size} --period=${period} --compress=${compress}`);
        }
        catch (error) {
            console.log('setConfiguration error:', error);
        }
        return response;
    });
}
exports.setConfiguration = setConfiguration;
function deleteConfiguration(name) {
    if (!name)
        throw "Name is required";
    return Utils.OSExecute(`apx-logrotate remove --name=${name}`);
}
exports.deleteConfiguration = deleteConfiguration;
function onLogEvent(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "logrotate/notification/state";
        // Subscribe to receive redis updates
        try {
            var state;
            var handler = (channel, data) => {
                if (channel != topic)
                    return;
                let clearToSend = true;
                try {
                    state = JSON.parse(data);
                }
                catch (error) {
                    clearToSend = false;
                    console.log('onLogEvent syntax error:', error);
                }
                if (clearToSend) {
                    callback(state);
                }
            };
            Redis_1.SystemRedisSubscriber.subscribe(topic);
            Redis_1.SystemRedisSubscriber.on("message", handler);
        }
        catch (error) {
            console.error('onLogEvent error:', error);
            errorCallback(error);
        }
        let returnable = {
            unsubscribe: () => {
                Redis_1.SystemRedisSubscriber.off("message", handler);
                Redis_1.SystemRedisSubscriber.unsubscribe(topic);
            },
            off: function () { this.unsubscribe(); }
        };
        return returnable;
    });
}
exports.onLogEvent = onLogEvent;
