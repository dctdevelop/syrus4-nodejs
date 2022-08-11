/**
 * Time Windows module setup get and set counters from APEX OS
 * @module Windows
 */
import * as Utils from "./Utils";
import { SystemRedisSubscriber as subscriber } from "./Redis";

interface WindowEvent {
    name: string, 
    enabled: boolean,
    from: string,
    to: string,
    type: string,
    state: boolean 
    timezone: string,
    daysOfWeek: string,
}

export async function setWindow( name: string,  type: string, from: string, to: string, dayOfWeek: string, timezone: string) {
	if (!name) throw "name property is required!"

    let response = undefined
    try {
        response = await Utils.OSExecute(`apx-time-window create --name=${name} --type=${type} --from=${from} --to=${to} --dow=${dayOfWeek} --tz=${timezone}`) 
    } catch (error) {
        console.log('setConfiguration error:', error);
    }
    return response;
}

export async function getStatus(name:string = 'all') : Promise<WindowEvent> {
    return JSON.parse(await Utils.OSExecute(`apx-time-window status --name=${name}`))
} 

export function deleteWindow(name:string): Promise<void> {
    if (!name) throw "Name is required";
    return Utils.OSExecute(`apx-time-window remove --name=${name}`)   
}

export async function onWindowEvent( callback:(arg: WindowEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "window/notification/state";

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
        console.log('onWindowEvent syntax error:', error);
      }

      if(clearToSend) {
        callback(state);
      }

    };
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error('onWindowEvent error:', error);
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
