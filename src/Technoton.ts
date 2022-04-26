
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
  event: string, 
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
  let last_data = await getStatus().catch(console.error);
  
  // Response not void and valid
  if(last_data && (last_data.level != undefined)) {
    const fuel_event: FuelEvent = {
      connected: (last_data.state == "connected") ? true : false,
      frequency: last_data.frequency,
      level: last_data.level,
      temperature: last_data.temperature,
      timestamp: last_data.timestamp,
      event: null
    };
    callback(fuel_event);

  } else {
    // Response not there
    const fuel_event : FuelEvent = {
      connected: false,
      frequency: 0,
      level: 0,
      temperature: 0,
      timestamp: 0,
      event: null
    };
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