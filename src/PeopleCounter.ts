/**
 * PeopleCounter module setup get and set Safe engine cut of from APEX OS
 * @module PeopleCounter
 */
import * as Utils from "./Utils";
import { SystemRedisSubscriber as subscriber } from "./Redis";

interface PeopleCountInterval {
    start_time: number,
    end_time: number,
    adult: {
        enter: number,
        exit: number
    },
    children: {
        enter: number,
        exit: number
    }
}

interface PeopleCountEvent {
    system_epoch: number,
    report_type: string,
    report: PeopleCountInterval[],
}

export async function getStatus({ from, to, type }): Promise <PeopleCountEvent> {
    if (!from) throw "peopleCounting getStatus error: from required";
    if (!to) throw "peopleCounting getStatus error: to required";
    if (!type) throw "peopleCounting getStatus error: type required";
    return await Utils.OSExecute(`apx-ndm-pc report --from=${from} --to=${to} --type=${type}`);
} 

export async function onPeopleCountingEvent(callback: (arg: PeopleCountEvent) => void, errorCallback: (arg: Error) => void ) : Promise<{ unsubscribe: () =>  void, off: () => void }> {
    const topic = "ndm/notification/people_counting/event";

    // Callback handler 
    const handler = (channel: string, data: any) => {
        if (channel != topic) return

        const obj = JSON.parse(data);
        const event : PeopleCountEvent = obj;
        callback(event);
    }
    
    try {
        subscriber.subscribe(topic);
        subscriber.on("message", handler);
    } catch (error) {
        console.log("onPeopleCouningEvent error:", error );
        errorCallback(error);
    }

    
    return {
        unsubscribe: () => {
        subscriber.off("message", handler);
        subscriber.unsubscribe(topic);  
      },
      off: () => {
        this.unsubscribe();
      }    
    }
}