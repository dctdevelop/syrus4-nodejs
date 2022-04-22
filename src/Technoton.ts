
/**
 * Technoton module get information about Technoton fuel level
 * @module Technoton
 */
import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

/**
 * FuelEvent published via the broker from the core tool
 * @interface FuelEvent
 */
export interface FuelEvent {
  connected: boolean,
  frequency: number,
  temp: number,
  level: number,
  conn_epoch: number,
  disc_epoch: number  
}

/**
 * WarningEvent published via the broker from the core tool
 * level_i: Last level 
 * level_e: Current level  
 * @interface WarningEvent
 */
export interface WarningEvent {
  time: number,
  threshold: number,
  level_i: number,
  level_e: number,
  epoch: number,             
}

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

export async function onFuelEvent( callback:(arg: FuelEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "serial/notification/technoton/state";
  // Subscribe to receive redis updates
  try {
    var state: FuelEvent;
    var handler = (channel: string, data: any) => {
    if (channel != topic) return
      state = JSON.parse(data);
      callback(state);

    };
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error('onFuelEvent error:', error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(topic);
    },
    off: function () { this.unsubscribe() }
  };
  return returnable;
}

export async function onWarningEvent( callback:(arg: WarningEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "serial/notification/technoton/warning";
  // Subscribe to receive redis updates
  try {
    var state: WarningEvent;
    var handler = (channel: string, data: any) => {
    if (channel != topic) return
      state = JSON.parse(data);
      callback(state);
    };
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error('onWarningEvent error:', error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(topic);
    },
    off: function () { this.unsubscribe() }
  };
  return returnable;
}