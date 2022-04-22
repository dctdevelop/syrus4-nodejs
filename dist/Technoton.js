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
exports.onWarningEvent = exports.onFuelEvent = void 0;
/**
 * Technoton module get information about Technoton fuel level
 * @module Technoton
 */
const Redis_1 = require("./Redis");
/**
export function getAll(): Promise<FuelEvent[]> {
  return Utils.OSExecute(`apx-serial-rfid list`);
}

export function getLast(): Promise<FuelEvent>{
  return Utils.OSExecute(`apx-serial-rfid get --last`);
}

export function clearLast(): Promise<FuelEvent>{
  return Utils.OSExecute(`apx-serial-rfid clear --last`);
}

export function setRFIDAlias(id: string, alias: string): Promise<void>{
  if(alias == "") throw "Alias Name is required";
  if(id == "") throw "RFID id is required";
  return Utils.OSExecute(`apx-serial set --id=${id} --alias=${alias}`);
}

export function removeAlias(id: string): Promise<void>{
  if(id == "") throw "Id is required";
  return Utils.OSExecute(`apx-serial-rfid remove --id=${id}`);
}

export function removeAll(): Promise<void>{
  return Utils.OSExecute('apx-serial-rfid remove --all');
}*/
function onFuelEvent(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "serial/notification/technoton/state";
        // Subscribe to receive redis updates
        try {
            var state;
            var handler = (channel, data) => {
                if (channel != topic)
                    return;
                state = JSON.parse(data);
                callback(state);
            };
            Redis_1.SystemRedisSubscriber.subscribe(topic);
            Redis_1.SystemRedisSubscriber.on("message", handler);
        }
        catch (error) {
            console.error('onFuelEvent error:', error);
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
exports.onFuelEvent = onFuelEvent;
function onWarningEvent(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const topic = "serial/notification/technoton/warning";
        // Subscribe to receive redis updates
        try {
            var state;
            var handler = (channel, data) => {
                if (channel != topic)
                    return;
                state = JSON.parse(data);
                callback(state);
            };
            Redis_1.SystemRedisSubscriber.subscribe(topic);
            Redis_1.SystemRedisSubscriber.on("message", handler);
        }
        catch (error) {
            console.error('onWarningEvent error:', error);
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
exports.onWarningEvent = onWarningEvent;
