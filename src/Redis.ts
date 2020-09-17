import * as Redis from "ioredis";

const REDIS_CONF = {
	"port": 6379,
	"host": "127.0.0.1",
}
var redisClient = new Redis(REDIS_CONF);
var redisSubscriber = new Redis(REDIS_CONF);

redisSubscriber.setMaxListeners(50);
redisClient.setMaxListeners(50);

export default { redisClient, redisSubscriber, REDIS_CONF };
export  { redisClient, redisSubscriber, REDIS_CONF };
