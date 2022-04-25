
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
  temperature: number,
  level: number,
  timestamp: number,  
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
  timestamp: number,             
}

/**
 * Status published via the broker from the core tool
 * show the sensor status and configurations
 *   
 * @interface StatusEvent
 */
export interface StatusEvent {
  state: string, 
  temperature: number,
  frequency: number,
  level: number,
  timestamp: number,
  consumption_threshold: number,
  consumption_window: number,
  fuelling_threshold: number
}

 
export function getStatus(): Promise<StatusEvent>{
  return Utils.OSExecute(`apx-serial-fs status`);
}

export function setConsumption(threshold: number, window: number): Promise<void> {
  if (threshold == undefined) throw "Consumption threshold required";
  if (window == undefined) throw "Consumption window required";
  return Utils.OSExecute(`apx-serial-fs set --consumption-threshold=${threshold} --consumption-window=${window}`);
}

export function setFuelling(threshold: number): Promise<void> {
  if (threshold == undefined) throw "Fuelling threshold required";
  return Utils.OSExecute(`apx-serial-fs set --fuelling-threshold=${threshold}`);
}

export async function onFuelEvent( callback:(arg: FuelEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "serial/notification/fuel_sensor/state";
  // Get last Fuel data
  //let last_data = await getStatus().catch(console.error);
  let last_data = null;
  if(last_data) {
    // Response not void
    let fuel_event: FuelEvent;
    fuel_event.connected = (last_data.state == "connected") ? true : false;
    fuel_event.frequency = last_data.frequency;
    fuel_event.level = last_data.level;
    fuel_event.temperature = last_data.temperature;
    fuel_event.timestamp = last_data.timestamp;
    callback(fuel_event);

  } else {
    // Response void
    let fuel_event: FuelEvent;
    fuel_event.connected = false;
    fuel_event.frequency = 0;
    fuel_event.level = 0;
    fuel_event.temperature = 0;
    fuel_event.timestamp = 0;
    callback(fuel_event);
  }

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
  const topic = "serial/notification/fuel_sensor/warning";
  // Subscribe to receive redis updates
  try {
    var state: WarningEvent;
    var handler = (channel: string, data: any) => {
    if (channel != topic) return
      if(data == undefined) return
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