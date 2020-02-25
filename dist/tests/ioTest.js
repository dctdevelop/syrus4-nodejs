"use strict";
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
const syrus4_1 = require("../syrus4");
const axios_1 = require("axios");
const { execFile } = require("child_process");
const endPoint = "https://pegasus1.peginstances.com/receivers/json";
const imei = 867698040023502;
var last_position = null;
var wathPositionHandler = null;
var args = [
    "-f",
    "lavfi",
    "-i",
    "anullsrc",
    "-rtsp_transport",
    "udp",
    "-i",
    "rtsp://admin:2233@192.168.2.44/11",
    "-tune",
    "zerolatency",
    "-vcodec",
    "libx264",
    "-t",
    "12:00:00",
    "-pix_fmt",
    "+",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-strict",
    "experimental",
    "-f",
    "flv",
    "rtmp://a.rtmp.youtube.com/live2/zu5c-yae2-h42s-7b8m"
];
var timeout = null;
function run() {
    syrus4_1.IOS.watchInputState("IGN", (state) => __awaiter(this, void 0, void 0, function* () {
        if (`${state}` == "true") {
            console.log("hostspot enabled");
            syrus4_1.Hotspot.start();
            timeout = setTimeout(() => {
                execFile("ffmpeg", args, function (error, stdout, stderr) {
                    console.log(arguments);
                });
            }, 1000 * 15);
        }
        else {
            console.log("hostspot disabled");
            syrus4_1.Hotspot.stop();
            clearTimeout(timeout);
            execFile("killall", ["-9", "ffmpeg"], function (error, stdout, stderr) {
                console.log(arguments);
            });
        }
        if (last_position) {
            var payload = syrus4_1.Utils.toJSONReceiver(last_position, imei, 1);
            payload[0]["event.label"] = `${state}` == "true" ? "ignon" : "ignoff";
            payload[0]["timestamp"] = Date.now() / 1000;
            payload[0]["io.ignition"] = `${state}` == "true";
            console.log(payload);
            yield axios_1.default.post(endPoint, payload).catch(err => console.error(err));
            payload[0]["event.label"] = `${state}` == "true" ? "hsup" : "hsdw";
            payload[0]["timestamp"] = Date.now() / 1000;
            console.log(payload);
            yield axios_1.default.post(endPoint, payload).catch(err => console.error(err));
        }
    }));
    console.log("waiting for position events");
    // * Every GPS Changes
    wathPositionHandler = syrus4_1.GPS.watchPosition(position => {
        last_position = position;
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
