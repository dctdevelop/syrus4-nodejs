import Redis from "ioredis";

interface REDIS { host: string, port: number, password?: string }

let { SYRUS4G_REMOTE } = process.env
let { SYRUS4G_APPS_REDIS_HOST, SYRUS4G_APPS_REDIS_PORT } = process.env
let { SYRUS4G_SYSTEM_REDIS_HOST, SYRUS4G_SYSTEM_REDIS_PORT, SYRUS4G_SYSTEM_REDIS_PW } = process.env

if (!SYRUS4G_REMOTE) {
	SYRUS4G_APPS_REDIS_HOST = "127.0.0.1"
	SYRUS4G_APPS_REDIS_PORT = "6379"

	SYRUS4G_SYSTEM_REDIS_HOST = "127.0.0.1"
	SYRUS4G_SYSTEM_REDIS_PORT = "7480"
	SYRUS4G_SYSTEM_REDIS_PW = ""
}

const REDIS_CONF: REDIS = {
	"host": SYRUS4G_APPS_REDIS_HOST,
	"port": parseInt(SYRUS4G_APPS_REDIS_PORT),
}
const SYSTEM_REDIS_CONF: REDIS = {
	"host": SYRUS4G_SYSTEM_REDIS_HOST,
	"port": parseInt(SYRUS4G_SYSTEM_REDIS_PORT),
	"password": SYRUS4G_SYSTEM_REDIS_PW,
}
function _obfuscate(item:REDIS):REDIS {
	let copy = JSON.parse(JSON.stringify(item))
	if (copy.password?.length) copy.password = "*".repeat(copy.password.length)
	return copy
}
console.log({
	REDIS_CONF: _obfuscate(REDIS_CONF),
	SYSTEM_REDIS_CONF: _obfuscate(SYSTEM_REDIS_CONF)
})

const redisClient = new Redis(REDIS_CONF);
const redisSubscriber = new Redis(REDIS_CONF);
const SystemRedisClient = new Redis(SYSTEM_REDIS_CONF);
const SystemRedisSubscriber = new Redis(SYSTEM_REDIS_CONF);

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
