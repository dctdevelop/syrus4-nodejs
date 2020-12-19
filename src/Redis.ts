import * as Redis from "ioredis";

let { SYRUS4G_REMOTE } = process.env
let { SYRUS4G_APPS_REDIS_HOST, SYRUS4G_APPS_REDIS_PORT } = process.env
let { SYRUS4G_SYSTEM_REDIS_HOST, SYRUS4G_SYSTEM_REDIS_PORT, SYRUS4G_SYSTEM_REDIS_PW } = process.env

if (!SYRUS4G_REMOTE) {
	SYRUS4G_APPS_REDIS_HOST = "127.0.0.1"
	SYRUS4G_APPS_REDIS_PORT = "6379"

	SYRUS4G_SYSTEM_REDIS_HOST = "127.0.0.1"
	SYRUS4G_SYSTEM_REDIS_PORT = "7480"
	SYRUS4G_SYSTEM_REDIS_PW = "BrokerCore99*-"
}

const REDIS_CONF = {
	"host": SYRUS4G_APPS_REDIS_HOST,
	"port": parseInt(SYRUS4G_APPS_REDIS_PORT),
}
var SYSTEM_REDIS_CONF = {
	"host": SYRUS4G_SYSTEM_REDIS_HOST,
	"port": parseInt(SYRUS4G_SYSTEM_REDIS_PORT),
	"password": SYRUS4G_SYSTEM_REDIS_PW,
}
console.log({ REDIS_CONF, SYSTEM_REDIS_CONF })
var redisClient = new Redis(REDIS_CONF);
var redisSubscriber = new Redis(REDIS_CONF);
var SystemRedisClient = new Redis(SYSTEM_REDIS_CONF);
var SystemRedisSubscriber = new Redis(SYSTEM_REDIS_CONF);

redisSubscriber.setMaxListeners(50);
redisClient.setMaxListeners(50);
SystemRedisClient.setMaxListeners(50);
SystemRedisSubscriber.setMaxListeners(50);

export async function disconnectAll(){
	redisClient.disconnect()
	redisSubscriber.disconnect()
	SystemRedisClient.disconnect()
	SystemRedisSubscriber.disconnect()
}

export { redisClient, redisSubscriber, SystemRedisClient, SystemRedisSubscriber };
