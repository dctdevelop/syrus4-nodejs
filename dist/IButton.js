"use strict";
/**
 * IButton module get information about onewire
 * @module IButton
 */
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
exports.onIButtonChange = exports.removeIButtonAlias = exports.setIButtonAlias = exports.getLast = exports.getIButton = exports.getIButtons = exports.IButtonUpdate = void 0;
const Redis_1 = require("./Redis");
const Utils = require("./Utils");
/**
 * Event published by the sdk composed of of multiple IButtonEvent
 * authorized contains events from whitelisted ibuttons
 * @class IButtonUpdate
 */
class IButtonUpdate {
    // TODO: alias lookups form initial fetch + publishes
    // alias: {[alias: string]: IButtonEvent}
    constructor() {
        this.authorized = {};
        this.last = null;
        this.connected = null;
    }
    digest(event) {
        this.last = event;
        if (event.connected)
            this.connected = event;
        else
            this.connected = null;
        this.last = event;
        if (event.whitelisted) {
            this.authorized.last = event;
            if (event.connected)
                this.authorized.connected = event;
            else
                this.authorized.connected = null;
        }
        return this;
    }
}
exports.IButtonUpdate = IButtonUpdate;
/**
 * allow to get al lthe state of the ibuttons connected
 */
function getIButtons() {
    return Utils.OSExecute("apx-onewire ibutton getall");
}
exports.getIButtons = getIButtons;
/**
 * allow to get al lthe state of the ibuttons connected
 */
function getIButton(iButton) {
    if (iButton == "")
        throw "iButton is required";
    return Utils.OSExecute(`apx-onewire ibutton get ${iButton}`);
}
exports.getIButton = getIButton;
function getLast() {
    return Utils.OSExecute(`apx-onewire ibutton get_last`);
}
exports.getLast = getLast;
/**
 * allow to get al lthe state of the ibuttons connected
 */
function setIButtonAlias(iButton, aliasName) {
    if (aliasName == "")
        throw "Alias Name is required";
    if (iButton == "")
        throw "iButton is required";
    return Utils.OSExecute(`apx-onewire ibutton create ${iButton} ${aliasName}`);
}
exports.setIButtonAlias = setIButtonAlias;
/**
 * remove Alias from ibutton whitelist
 */
function removeIButtonAlias(aliasName) {
    if (aliasName == "")
        throw "aliasName is required";
    return Utils.OSExecute(`apx-onewire ibutton delete ${aliasName}`);
}
exports.removeIButtonAlias = removeIButtonAlias;
/**
 * monitor iButton notifications
 */
function onIButtonChange(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "onewire/notification/ibutton/state";
        // execute callback with last data
        let ib_update = new IButtonUpdate();
        let last_ib_event = yield getLast().catch(console.error);
        if (last_ib_event) {
            callback(ib_update.digest(last_ib_event));
        }
        // set up subscribe to receive updates
        try {
            var handler = (channel, raw) => {
                if (channel != topic)
                    return;
                let data = JSON.parse(raw);
                callback(ib_update.digest(data));
            };
            Redis_1.SystemRedisSubscriber.subscribe(topic);
            Redis_1.SystemRedisSubscriber.on("message", handler);
        }
        catch (error) {
            console.error(error);
            errorCallback(error);
        }
        var returnable = {
            unsubscribe: () => {
                Redis_1.SystemRedisSubscriber.off("message", handler);
                Redis_1.SystemRedisSubscriber.unsubscribe(topic);
            },
            off: function () { this.unsubscribe(); }
        };
        return returnable;
    });
}
exports.onIButtonChange = onIButtonChange;
