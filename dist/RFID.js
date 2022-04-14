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
exports.onRFIDEvent = exports.removeAll = exports.removeAlias = exports.setRFIDAlias = exports.clearLast = exports.getLast = exports.getAll = exports.RFIDUpdate = void 0;
/**
 * RFID module get information about RFID states
 * @module RFID
 */
const Redis_1 = require("./Redis");
const Utils = require("./Utils");
/**
 * Event published by the sdk composed of of multiple RFID
 * authorized contains events from RFID
 * @class RFIDUpdate
 */
class RFIDUpdate {
    constructor() {
        this.last = null;
        this.authorized = {};
    }
    digest(event) {
        this.last = event;
        if (event.whitelisted) {
            this.authorized.last = event;
        }
        return this;
    }
}
exports.RFIDUpdate = RFIDUpdate;
// TODO: Check getAll()
function getAll() {
    return Utils.OSExecute(`apx-serial-rfid list`);
}
exports.getAll = getAll;
function getLast() {
    return Utils.OSExecute(`apx-serial-rfid get --last`);
}
exports.getLast = getLast;
function clearLast() {
    return Utils.OSExecute(`apx-serial-rfid clear --last`);
}
exports.clearLast = clearLast;
function setRFIDAlias(id, alias) {
    if (alias == "")
        throw "Alias Name is required";
    if (id == "")
        throw "RFID id is required";
    return Utils.OSExecute(`apx-serial set --id=${id} --alias=${alias}`);
}
exports.setRFIDAlias = setRFIDAlias;
function removeAlias(id) {
    if (id == "")
        throw "Id is required";
    return Utils.OSExecute(`apx-serial-rfid remove --id=${id}`);
}
exports.removeAlias = removeAlias;
function removeAll() {
    return Utils.OSExecute('apx-serial-rfid remove --all');
}
exports.removeAll = removeAll;
function onRFIDEvent(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "serial/notification/rfid/state";
        // GET last RFID data
        let rfid_update = new RFIDUpdate();
        let last_rfid_event = yield getLast().catch(console.error);
        if (last_rfid_event) {
            callback(rfid_update.digest(last_rfid_event));
        }
        // Subscribe to receive updates
        try {
            var state;
            var handler = (channel, data) => {
                if (channel != topic)
                    return;
                state = JSON.parse(data);
                callback(rfid_update.digest(state));
            };
            Redis_1.SystemRedisSubscriber.subscribe(topic);
            Redis_1.SystemRedisSubscriber.on("message", handler);
        }
        catch (error) {
            console.error('onRFIDEvent error:', error);
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
exports.onRFIDEvent = onRFIDEvent;
