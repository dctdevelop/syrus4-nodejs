/**
 * Logrotate module setup get and set counters from APEX OS
 * @module PulseCounter
 */
import * as Utils from "./Utils"
import { SystemRedisSubscriber as subscriber } from "./Redis";
import _isObjectLike from 'lodash.isobjectlike';

interface PulseEvent {
  topic: string,
  payload: number | boolean,
}

export async function getLast() : Promise<any> {
    
    try {
      const pulse = await Utils.OSExecute(`apx-io pulse_counter --status`).catch(console.error);
      const pulseCount = JSON.parse(JSON.stringify(pulse));
      return pulseCount.count;
    } catch (error) {
      console.log('getLastPulseCount error:', error);
      return 0;
    }  
} 

export async function onPulseEvent( callback:(payload: PulseEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "interface/pulse_counter/*"; // update and event

  // Get the current state of pulse counter
  try {
    await getLast().then( response => {
      const lastPulseEvent: PulseEvent = {
        topic: "interface/pulse_counter/update",
        payload: response
      } 
      callback(lastPulseEvent);
    }).catch(console.error)
  } catch (error) {
    console.log('onPulseEvent error:', error);
  }

  // Subscribe to receive redis updates
  try {
    var handler = (pattern: string, channel: string, data: any) => {
      if (!channel.startsWith('interface/pulse_counter/')) return

      callback({ topic: channel, payload: data })
    };
    subscriber.psubscribe(topic);
    subscriber.on("pmessage", handler);
  } catch (error) {
    console.error('onPulseEvent error:', error);
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

