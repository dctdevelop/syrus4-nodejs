"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
const REDIS_CONF = {
    "port": 6379,
    "host": "127.0.0.1",
};
exports.REDIS_CONF = REDIS_CONF;
var redisClient = new Redis(REDIS_CONF);
exports.redisClient = redisClient;
var redisSubscriber = new Redis(REDIS_CONF);
exports.redisSubscriber = redisSubscriber;
exports.default = { redisClient, redisSubscriber, REDIS_CONF };
