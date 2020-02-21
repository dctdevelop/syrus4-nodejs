"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syrus4_1 = require("../syrus4");
const axios_1 = require("axios");
const endPoint = "https://pegasus1.peginstances.com/receivers/json";
const imei = 867698040023502;
const track_resolution = {
    distance: 50,
    bearing: 20,
    time: 600
};
var last_position = null; // set the last valid position;
var last_transmision = null;
var wathPositionHandler = null;
function run() {
    console.log("waiting for position events");
    // * Every GPS Changes
    wathPositionHandler = syrus4_1.GPS.watchPosition(position => {
        last_transmision = position;
        var payload = syrus4_1.Utils.toJSONReceiver(position, imei, 1);
        axios_1.default.post(endPoint, payload).catch(err => console.error(err));
    }, err => {
        console.error(err);
    }, {
        accuracy: 50,
        time: 600,
        bearing: 20,
        distance: 50
    });
    // * Every Input Change
    // Alias: IOS.WatchIgnitionState(Callback)
    /**
     * newState: boolean
     */
    // IOS.WatchInputState(async (newState) => {
    //     var position = await GPS.getCurrentPosition({ desiredAccuracy: 50 });
    //     var label = newState == true ? "ignon" : "ignoff";
    //     http.post(endPoint, {
    //         coordinate: position,
    //         label: label
    //     })
    // }, "ign");
    /**
     * Watch for Input2 connected to Driver's Door
     */
    // IOS.WatchInput2State(async (newState) => {
    //     var position = await GPS.getCurrentPosition({ desiredAccuracy: 50 });
    //     var label = newState == true ? "dooropen" : "doorclose";
    //     http.post(endPoint, {
    //         coordinate: position,
    //         label: label
    //     })
    // })
}
exports.run = run;
function stop() {
    if (wathPositionHandler) {
        console.log("stop watcher for position events");
        wathPositionHandler.unsuscribe();
    }
}
exports.stop = stop;
run();
//# sourceMappingURL=test.js.map