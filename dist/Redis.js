"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRedisSubscriber = exports.SystemRedisClient = exports.redisSubscriber = exports.redisClient = exports.disconnectAll = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let { SYRUS4G_REMOTE } = process.env;
let { SYRUS4G_APPS_REDIS_HOST, SYRUS4G_APPS_REDIS_PORT } = process.env;
let { SYRUS4G_SYSTEM_REDIS_HOST, SYRUS4G_SYSTEM_REDIS_PORT, SYRUS4G_SYSTEM_REDIS_PW } = process.env;
if (!SYRUS4G_REMOTE) {
    SYRUS4G_APPS_REDIS_HOST = "127.0.0.1";
    SYRUS4G_APPS_REDIS_PORT = "6379";
    SYRUS4G_SYSTEM_REDIS_HOST = "127.0.0.1";
    SYRUS4G_SYSTEM_REDIS_PORT = "7480";
    SYRUS4G_SYSTEM_REDIS_PW = "";
}
const REDIS_CONF = {
    "host": SYRUS4G_APPS_REDIS_HOST,
    "port": parseInt(SYRUS4G_APPS_REDIS_PORT),
};
const SYSTEM_REDIS_CONF = {
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
const redisClient = new ioredis_1.default(REDIS_CONF);
exports.redisClient = redisClient;
const redisSubscriber = new ioredis_1.default(REDIS_CONF);
exports.redisSubscriber = redisSubscriber;
const SystemRedisClient = new ioredis_1.default(SYSTEM_REDIS_CONF);
exports.SystemRedisClient = SystemRedisClient;
const SystemRedisSubscriber = new ioredis_1.default(SYSTEM_REDIS_CONF);
exports.SystemRedisSubscriber = SystemRedisSubscriber;
redisSubscriber.setMaxListeners(50);
redisClient.setMaxListeners(50);
SystemRedisClient.setMaxListeners(50);
SystemRedisSubscriber.setMaxListeners(50);
async function disconnectAll() {
    redisClient.disconnect();
    redisSubscriber.disconnect();
    SystemRedisClient.disconnect();
    SystemRedisSubscriber.disconnect();
}
exports.disconnectAll = disconnectAll;
