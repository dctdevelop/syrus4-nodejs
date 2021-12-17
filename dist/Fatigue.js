"use strict";
/**
 * Fatigue module, get fatigue sensor information and events
 * @module Fatigue
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onFatigueEvent = void 0;
const Redis_1 = require("./Redis");
const Utils = require("./Utils");
function onFatigueEvent(callback, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const serial_state_topic = "serial/notification/fatigue_s/state";
        const serial_photo_topic = "serial/notification/fatigue_s/photo";
        const mdsm7_topic = "fatigue/notification/mdsm7";
        const mdsm7_topic_update = "ndm/notification/mdsm7/update";
        const mdsm7_topic_event = "ndm/notification/mdsm7/event";
        const cipia_topic_update = "ndm/notification/cipia/update";
        const cipia_topic_event = "ndm/notification/cipia/event";
        const all_topics = [
            serial_state_topic, serial_photo_topic,
            mdsm7_topic, mdsm7_topic_event, mdsm7_topic_update,
            cipia_topic_event, cipia_topic_update,
        ];
        // subscribe to receive updates
        try {
            var state = yield Utils.OSExecute('apx-serial fatigue_sensor state');
            state.photos = {};
            if (state.latest_photo) {
                state.channel = 'serial';
                state.epoch = Number(state.latest_photo.split('-')[0]);
                state.event = state.latest_photo.split('-')[1].split('.')[0];
            }
            callback(state);
            var handler = (channel, data) => {
                if (!all_topics.includes(channel))
                    return;
                if (channel == serial_state_topic)
                    state.state = data;
                if (channel == serial_photo_topic) {
                    let photo_type = data.split('-')[1].split('.')[0];
                    state.latest_photo = data;
                    state.photos[photo_type] = data;
                }
                if (state.latest_photo) {
                    state.channel = 'serial';
                    state.epoch = Number(state.latest_photo.split('-')[0]);
                    state.event = state.latest_photo.split('-')[1].split('.')[0];
                }
                if ([mdsm7_topic, mdsm7_topic_event].includes(channel)) {
                    data = JSON.parse(data);
                    state.channel = 'mdsm7';
                    state.epoch = data.system_epoch;
                    state.event = data.event;
                }
                if (channel == mdsm7_topic_update) {
                    data = JSON.parse(data);
                    state.channel = 'mdsm7';
                    state = Object.assign(Object.assign({}, state), data);
                }
                if (channel == cipia_topic_event) {
                    data = JSON.parse(data);
                    state.channel = 'cipia';
                    state.epoch = data.system_epoch;
                    state.event = data.event;
                }
                if (channel == cipia_topic_update) {
                    data = JSON.parse(data);
                    state.channel = 'cipia';
                    state = Object.assign(Object.assign({}, state), data);
                }
                callback(state);
            };
            all_topics.map((t) => Redis_1.SystemRedisSubscriber.subscribe(t));
            Redis_1.SystemRedisSubscriber.on("message", handler);
        }
        catch (error) {
            console.error(error);
            errorCallback(error);
        }
        let returnable = {
            unsubscribe: () => {
                Redis_1.SystemRedisSubscriber.off("message", handler);
                all_topics.map((t) => Redis_1.SystemRedisSubscriber.unsubscribe(t));
            },
            off: function () { this.unsubscribe(); }
        };
        return returnable;
    });
}
exports.onFatigueEvent = onFatigueEvent;
