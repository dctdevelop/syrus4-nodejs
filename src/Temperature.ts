/**
 * Onewire module get information about onewire
 * @module Onewire
 */

import { SystemRedisSubscriber as subscriber } from "./Redis";
import Utils from "./Utils";

/**
 * TemperatureEvent published via the broker from the core tools
 * @interface TemperatureEvent
 */
interface TemperatureEvent {
  id: string | null
  alias: string
  value: number
  connected: boolean
  epoch: number
}

/**
 * Event published by the sdk composed of of multiple TemperatureEvents
 * authorized object contains events from whitelisted ibuttons
 * @class TemperatureUpdate
 */
class TemperatureUpdate{
  public last: TemperatureEvent
  public aliases: {[alias: string]: TemperatureEvent}
  public sensors: {[id: string]: TemperatureEvent}

  constructor(){}

  public digest(event: TemperatureEvent){
    if (event.alias?.length){
      this.aliases[event.alias] = event
    }
    this.sensors[event.id] = event
    if (this.last?.epoch < event.epoch){
      this.last = event
    }
    return this
  }
}

/**
 * get the current temperature state
 */
export function getTemperatures(): Promise<{temperatures: TemperatureEvent[]}>{
  return Utils.OSExecute("apx-onewire-temperature getall");
}

/**
 * get reading from a specific sensor, by id or alias
 */
export function getTemperature(lookup:string): Promise<TemperatureEvent>{
  if (lookup.length > 50) throw "alias is too long (max 50)";
  return Utils.OSExecute(`apx-onewire-temperature get ${lookup}`);
}

/**
 * set alias to a temperature sensor
 */
export function setTemperatureAlias(sensorId: string, alias: string): Promise<void>{
  if(alias.length > 50) throw "alias is too long (max 50)";
  if(sensorId.length != 15) throw "sensorId must be 15 characters long";
  return Utils.OSExecute(`apx-onewire-temperature add ${alias} ${sensorId}`);
}

/**
 * remove alias from temperature sensor
 */
export function removeTemperatureAlias(lookup: string): Promise<void>{
  if (lookup.length > 50) throw "alias is too long (max 50)";
  return Utils.OSExecute(`apx-onewire-temperature remove ${lookup}`);
}

/**
 * remove aliases from all temperature sensors
 */
export function removeTemperatureAliases(): Promise<void> {
  return Utils.OSExecute(`apx-onewire-temperature remove_all`);
}

/**
 * monitor iButton notifications
 */
export async function onTemperaureChange(
  callback: (arg: TemperatureUpdate)=> void,
  errorCallback: (arg: Error)=> void): Promise<{unsubscribe: ()=>void, off: ()=> void}>{
  let topic = "onewire/notification/temperature/state"
  // execute callback with last data
  let update = new TemperatureUpdate()
  let state = await getTemperatures().catch(console.error)
  if(state) {
    state.temperatures.map(update.digest)
    callback(update)
  }
  // set up subscribe to receive updates
  try {
    var handler = (channel:string, raw:string) => {
      if (channel != topic) return
      let data = JSON.parse(raw)
      callback(update.digest(data))
    };
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  var returnable = {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(topic);
    },
    off: ()=> this.unsubscribe()
  };
  return returnable;
}

