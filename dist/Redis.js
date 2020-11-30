"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
const { execSync } = require("child_process");
const REDIS_CONF = {
    "port": 6379,
    "host": "127.0.0.1",
};
exports.REDIS_CONF = REDIS_CONF;
var SYSTEM_REDIS_CONF = {
    "port": 6379,
    "host": "127.0.0.1",
};
exports.SYSTEM_REDIS_CONF = SYSTEM_REDIS_CONF;
try {
    var about = JSON.parse(execSync("sudo apx-about"));
}
catch (error) {
    about = { apexVersion: "20.0.0" };
}
var ver = about.apexVersion.replace("apex-", "");
var semver = parseInt(ver.split(".")[0]) * 1000 + parseInt(ver.split(".")[1]) * 1;
if (semver >= 20046) {
    exports.SYSTEM_REDIS_CONF = SYSTEM_REDIS_CONF = {
        "port": 7480,
        "host": "127.0.0.1",
        "password": "BrokerCore99*-",
    };
}
var redisClient = new Redis(REDIS_CONF);
exports.redisClient = redisClient;
var redisSubscriber = new Redis(REDIS_CONF);
exports.redisSubscriber = redisSubscriber;
var SystemRedisClient = new Redis(SYSTEM_REDIS_CONF);
exports.SystemRedisClient = SystemRedisClient;
var SystemRedisSubscriber = new Redis(SYSTEM_REDIS_CONF);
exports.SystemRedisSubscriber = SystemRedisSubscriber;
redisSubscriber.setMaxListeners(50);
redisClient.setMaxListeners(50);
SystemRedisClient.setMaxListeners(50);
SystemRedisSubscriber.setMaxListeners(50);
exports.default = { redisClient, redisSubscriber, SystemRedisClient, SystemRedisSubscriber, REDIS_CONF, SYSTEM_REDIS_CONF };
