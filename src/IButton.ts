/**
 * IButton module get information about onewire
 * @module IButton
 */

import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

/**
 * IButtonEvent published via the broker from the core tools
 * @interface IButtonEvent
 */
export interface IButtonEvent {
  id: string | null
  alias: string
  whitelisted: boolean
  connected: boolean
  conn_epoch: number
  disc_epoch: number
}

/**
 * Event published by the sdk composed of of multiple IButtonEvent
 * authorized contains events from whitelisted ibuttons
 * @class IButtonUpdate
 */
export class IButtonUpdate{
  public authorized: {
    last?: IButtonEvent
    connected?: IButtonEvent
  }
  public last?: IButtonEvent
  public connected?: IButtonEvent

  // TODO: alias lookups form initial fetch + publishes
  // alias: {[alias: string]: IButtonEvent}

  constructor(){
    this.authorized = {}
    this.last = null
    this.connected = null
  }

  public digest(event:IButtonEvent){
    this.last = event
    if (event.connected) this.connected = event
    else this.connected = null

    this.last = event
    if (event.whitelisted) {
      this.authorized.last = event
      if (event.connected) this.authorized.connected = event
      else this.authorized.connected = null
    }
    return this
  }
}

/**
 * allow to get al lthe state of the ibuttons connected
 */
export function getIButtons(): Promise<{ibuttons: IButtonEvent[]}>{
  return Utils.OSExecute("apx-onewire ibutton getall");
}

/**
 * allow to get al lthe state of the ibuttons connected
 */
export function getIButton(iButton:string): Promise<IButtonEvent>{
  if(iButton == "") throw "iButton is required";
  return Utils.OSExecute(`apx-onewire ibutton get ${iButton}`);
}

export function getLast(): Promise<IButtonEvent>{
  return Utils.OSExecute(`apx-onewire ibutton get_last`);
}

/**
 * allow to get al lthe state of the ibuttons connected
 */
export function setIButtonAlias(iButton: string, aliasName: string): Promise<void>{
  if(aliasName == "") throw "Alias Name is required";
  if(iButton == "") throw "iButton is required";
  return Utils.OSExecute(`apx-onewire ibutton create ${iButton} ${aliasName}`);
}

/**
 * remove Alias from ibutton whitelist
 */
export function removeIButtonAlias(aliasName: string): Promise<void>{
  if(aliasName == "") throw "aliasName is required";
  return Utils.OSExecute(`apx-onewire ibutton delete ${aliasName}`);
}

/**
 * monitor iButton notifications
 */
export async function onIButtonChange(
  callback: (arg: IButtonUpdate)=> void,
  errorCallback: (arg: Error)=> void ): Promise<{unsubscribe: ()=>void, off: ()=> void}>{
  const topic = "onewire/notification/ibutton/state"
  // execute callback with last data
  let ib_update = new IButtonUpdate()
  let last_ib_event = await getLast().catch(console.error)
  if(last_ib_event) {
    callback(ib_update.digest(last_ib_event))
  }
  // set up subscribe to receive updates
  try {
    var handler = (channel:string, raw:string) => {
      if (channel != topic) return
      let data = JSON.parse(raw)
      callback(ib_update.digest(data))
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
    off: function(){this.unsubscribe()}
  };
  return returnable;
}

