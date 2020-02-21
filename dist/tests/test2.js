"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syrus4_1 = require("../syrus4");
const mqtt = require("mqtt");
const endPoint = "mqtt://mqtt.flespi.io";
const imei = 867698040023502;
const track_resolution = {
    distance: 50,
    bearing: 20,
    time: 600
};
var last_position = null; // set the last valid position;
var last_transmision = null;
var wathPositionHandler = null;
var diffInSecs = 0;
function run() {
    // * Every GPS Changes
    var client = mqtt.connect(endPoint, {
        username: "FlespiToken ctcfqdZA9x1iYCVEICVVG6vzMUwHHkFKBGNQJCeGX5OJvAc40XPwR9TtRf0pnuXP",
        clientId: "32e876b5-57d1-4cb3-8c1a-260dd0f16f04"
    });
    // console.log(client.options);
    client.on("connect", () => {
        console.log("connected");
        client.subscribe("dev/messagesrx", null, function (err, message) {
            console.log(message);
        });
    });
    client.on("disconnect", r => {
        console.log("disconnected", r);
    });
    client.on("message", function (topic, message) {
        console.log(topic, message.toString());
    });
    client.on("error", function (err) {
        console.error(err);
    });
    wathPositionHandler = syrus4_1.GPS.watchPosition(position => {
        // Executed everytime Gps send new location
        last_position = position; // deepscan-disable-line
        var payload = syrus4_1.Utils.toJSONReceiver(position, imei, 1);
        client.publish("dev/messagestx", JSON.stringify(payload[0]), null, console.log);
    }, err => {
        console.error(err);
    }, {
        accuracy: 50,
        time: 600,
        bearing: 20,
        distance: 50
    });
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
//# sourceMappingURL=test2.js.map