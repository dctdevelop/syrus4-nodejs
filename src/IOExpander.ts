/**
 * Logrotate module setup get and set counters from APEX OS
 * @module IOExpander
 */
import * as Utils from "./Utils"
import { SystemRedisSubscriber as subscriber } from "./Redis";
import _isObjectLike from 'lodash.isobjectlike';

interface IOStates {
  connected: boolean,
  in1: boolean,
  in2: boolean,
  in3: boolean,
  in4: boolean,

  out1: boolean,
  out2: boolean,
  out3: boolean,
  out4: boolean,
}

interface IOExEvent {
  topic: string,
  payload: string | null,
}

export async function getLast() : Promise<IOStates> {
  try {
     return await Utils.OSExecute(`apx-onewire iosexpander status`)
  } catch (error) {
    console.log('getLastIOExpander error:', error);
    return { connected: false } as IOStates;
  }
  
} 

export async function setOutput(name:string, value: boolean = true): Promise<any> {
    if (!name) throw "Name is required";
    const ioName = name.toLocaleUpperCase();
    return await Utils.OSExecute(`apx-onewire iosexpander set ${ioName} ${value}`)
}

export async function setState(name:string): Promise<any> {
  if (!name) throw "Name is required";
  const ioName = name.toLocaleUpperCase();
  return await Utils.$to(Utils.OSExecute(`apx-onewire iosexpander get ${ioName}`))
}


export async function onIOExpanderEvent( callback:(payload: IOExEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "onewire/notification/iosexpander/*";

  // Get the current state of the IOExpander
  try {
    await getLast().then( response => {
      const state = JSON.parse(JSON.stringify(response));
      const last_io_event = {
        topic: "onewire/notification/iosexpander/update",
        payload: state
      } 
      callback(last_io_event);
    }).catch(console.error)
  } catch (error) {
    console.log('onIOExpanderEvent error:', error);
  }

  // Subscribe to receive redis updates
  try {
    var handler = (patthern: string, channel: string, data: any) => {
      if (!channel.startsWith('onewire/notification/iosexpander')) return

      try {
        const state = JSON.parse(data)
        if (!_isObjectLike(state)) throw 'not JSON'
        callback({ topic: channel, payload: state })
      } catch (error) {
        console.log('onIOExpanderEvent syntax error:', error);
      }

    };
    subscriber.psubscribe(topic);
    subscriber.on("pmessage", handler);
  } catch (error) {
    console.error('onIOExpanderEvent error:', error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      subscriber.off("pmessage", handler);
      subscriber.punsubscribe(topic);
    },
    off: function () { this.unsubscribe() }
  };
  return returnable;
}

