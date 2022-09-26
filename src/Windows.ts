/**
 * Time Windows module setup get and set counters from APEX OS
 * @module Windows
 */
import * as Utils from "./Utils";
import { SystemRedisSubscriber as subscriber } from "./Redis";

interface WindowEvent {
    name: string, 
    enabled: boolean,
    state: boolean 
    start: string,
    end: string,
    from: string,
    to: string,
    type: string,
    timezone: string,
    days: string,
}

export async function setWindow(config) {
    console.log('setWindow:', config)
	if (!config.name) throw "name property is required!"

    let response = undefined
    try {
        response = await Utils.OSExecute(`apx-time-window set --name=${config.name} --type=${config.type} --start=${config.start} --end=${config.end} --from=${config.from} --to=${config.to} --days=${config.days} --timezone=${config.timezone} --enabled=${config.enabled}`) 
    } catch (error) {
        console.log('setConfiguration error:', error);
    }
    return response;
}

export async function getStatus(name:string = 'all') : Promise<WindowEvent[]> {
    return await Utils.OSExecute(`apx-time-window status --name=${name}`);
} 

export function deleteWindow(name:string): Promise<void> {
    if (!name) throw "Name is required";
    return Utils.OSExecute(`apx-time-window remove --name=${name}`)   
}

export async function onWindowEvent( callback:(arg: WindowEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "window/notification/state";

  // Get last Fuel data
  const windows_status = await getStatus('all').catch(console.error);
  const window_object = JSON.parse(JSON.stringify(windows_status));

  if (windows_status != undefined) {
      window_object.forEach(element => {
          callback(element);
      });
  }
  
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
