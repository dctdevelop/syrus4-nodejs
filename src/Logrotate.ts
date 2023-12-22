/**
 * Logrotate module setup get and set counters from APEX OS
 * @module Logrotate
 */
import * as Utils from "./Utils"
import { SystemRedisSubscriber as subscriber } from "./Redis";
/**
 * LogEvent published via the broker from the core tool
 * @interface LogEvent
 */
export interface LogEvent {
  name: string,
  event: string,
  path: string,
  size: number  // in MB 
}

export async function listConfigurations() {
	return JSON.parse(await Utils.OSExecute(`apx-logrotate read --name=all`));
}

export async function getConfiguration(name: string) {
    if (!name) throw "Name is required";
    return JSON.parse(await Utils.OSExecute(`apx-logrotate read --name=${name}`));
}

export async function getStatus(name:string = 'all') : Promise<LogEvent> {
    return JSON.parse(await Utils.OSExecute(`apx-logrotate status --name=${name}`))
} 

export async function setConfiguration(name:string, path: string, rotate: string = '1D', size: string = '100MB', compress: boolean = true, headers: string = ''): Promise<void> {
    if (!name) throw "Name is required";
    if (!path) throw "Path is required";
    
    const rotation = rotate.slice(0,-1);
    const rotate_size = size.slice(0,-1);
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
    
    let response = undefined
    try {
      if (headers != '') {
        response = await Utils.OSExecute(`apx-logrotate configure --name=${name} --path=${path} --rotate=${rotation} --size=${rotate_size} --period=${period} --compress=${compress} --headers=${headers}`)         
      } else {
        response = await Utils.OSExecute(`apx-logrotate configure --name=${name} --path=${path} --rotate=${rotation} --size=${rotate_size} --period=${period} --compress=${compress}`) 
      }
        
    } catch (error) {
        console.log('setConfiguration error:', error);
    }
    return response;
}

export function deleteConfiguration(name:string): Promise<void> {
    if (!name) throw "Name is required";
    return Utils.OSExecute(`apx-logrotate remove --name=${name}`)   
}

export async function onLogEvent( callback:(arg: LogEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "logrotate/notification/state";

  // Subscribe to receive redis updates
  try {
    var state: any;
    var handler = (channel: string, data: any) => {
    if (channel != topic) return
      let clearToSend = true;

      try {
        state = JSON.parse(data);
      } catch (error) {
        clearToSend = false;
        console.log('onLogEvent syntax error:', error);
      }

      if(clearToSend) {
        callback(state);
      }

    };
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error('onLogEvent error:', error);
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

