/**
 * Serial module, get information about serial state
 * @module Serial
 */

import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

/**
 * TemperatureEvent published via the broker from the core tools
 * @interface TemperatureEvent
 */
interface ModemEvent {
  type: "satcom" | "console",
  id: number,
  pack: string,
  version: string,
  signal: number,
  state: "connected",
  msg_st: number,
  buff_size: number,
  buff_count: number,
}

/**
 * get serial mode
 */
export function getSerialMode(): Promise<"console"|"modem"> {
  return Utils.OSExecute("apx-serial mode");
}

/**
 * set serial mode (console or modem)
 */
export function setSerialMode(mode: "modem"|"console"): Promise<ModemEvent> {
  return Utils.OSExecute(`apx-serial mode ${mode}`);
}

/**
 * get serial modem state
 */
export function getSerialModemState(): Promise<ModemEvent> {
  return Utils.OSExecute("apx-serial modem state");
}

/**
 * get modem buffer size
 */
export function getModemBufferSize(): Promise<number> {
  return Utils.OSExecute(`apx-serial modem buffer_size`);
}

/**
 * set the buffer size
 */
export function setModemBufferSize(size:number): Promise<void> {
  if (size < 10 || size > 500) throw "invalid buffer size, min: 10, max: 500";
  return Utils.OSExecute(`apx-serial modem buffer_size ${size}`);
}

/**
 * send a message
 */
export function send(message:string): Promise<void>{
  if (!message.length || message.length > 340) throw "invalid message length (max 340)";
  return Utils.OSExecute(`apx-serial modem send "${message}"`);
}

/**
 * monitor incoming serial messages
 */
export async function onIncomingMessage(
  callback: (arg: string) => void,
  errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {
  const topic = "serial/notification/modem/message"
  // set up subscribe to receive updates
  try {
    var handler = (channel: string, raw: string) => {
      if (channel != topic) return
      callback(raw)
    };
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error(error);
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
