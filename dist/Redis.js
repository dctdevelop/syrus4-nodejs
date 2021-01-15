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
exports.SystemRedisSubscriber = exports.SystemRedisClient = exports.redisSubscriber = exports.redisClient = exports.disconnectAll = void 0;
const Redis = require("ioredis");
let { SYRUS4G_REMOTE } = process.env;
let { SYRUS4G_APPS_REDIS_HOST, SYRUS4G_APPS_REDIS_PORT } = process.env;
let { SYRUS4G_SYSTEM_REDIS_HOST, SYRUS4G_SYSTEM_REDIS_PORT, SYRUS4G_SYSTEM_REDIS_PW } = process.env;
if (!SYRUS4G_REMOTE) {
    SYRUS4G_APPS_REDIS_HOST = "127.0.0.1";
    SYRUS4G_APPS_REDIS_PORT = "6379";
    SYRUS4G_SYSTEM_REDIS_HOST = "127.0.0.1";
    SYRUS4G_SYSTEM_REDIS_PORT = "7480";
    SYRUS4G_SYSTEM_REDIS_PW = "BrokerCore99*-";
}
const REDIS_CONF = {
    "host": SYRUS4G_APPS_REDIS_HOST,
    "port": parseInt(SYRUS4G_APPS_REDIS_PORT),
};
var SYSTEM_REDIS_CONF = {
    "host": SYRUS4G_SYSTEM_REDIS_HOST,
    "port": parseInt(SYRUS4G_SYSTEM_REDIS_PORT),
    "password": SYRUS4G_SYSTEM_REDIS_PW,
};
function _obfuscate(item) {
    var _a;
    let copy = JSON.parse(JSON.stringify(item));
    if ((_a = copy.password) === null || _a === void 0 ? void 0 : _a.length)
        copy.password = "*".repeat(copy.password.length);
    return copy;
}
console.log({
    REDIS_CONF: _obfuscate(REDIS_CONF),
    SYSTEM_REDIS_CONF: _obfuscate(SYSTEM_REDIS_CONF)
});
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
function disconnectAll() {
    return __awaiter(this, void 0, void 0, function* () {
        redisClient.disconnect();
        redisSubscriber.disconnect();
        SystemRedisClient.disconnect();
        SystemRedisSubscriber.disconnect();
    });
}
exports.disconnectAll = disconnectAll;
