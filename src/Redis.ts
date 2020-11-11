import * as Redis from "ioredis";
const { execSync } = require("child_process");

const REDIS_CONF = {
	"port": 6379,
	"host": "127.0.0.1",
}
var SYSTEM_REDIS_CONF = {
	"port": 6379,
	"host": "127.0.0.1",
	"password": null,
	"readOnly": false
}
var about =  JSON.parse(execSync("sudo apx-about"))
var ver = about.apexVersion.replace("apex-", "");
var semver = parseInt(ver.split(".")[0]) * 1000 + parseInt(ver.split(".")[1]) * 1;
if(semver >= 20046){
	 SYSTEM_REDIS_CONF = {
		"port": 7480,
		"host": "127.0.0.1",
		"password": "BrokerCore99*-",
		"readOnly": true
	}
}
var redisClient = new Redis(REDIS_CONF);
var redisSubscriber = new Redis(REDIS_CONF);
var SystemRedisClient = new Redis(SYSTEM_REDIS_CONF);
var SystemRedisSubscriber = new Redis(SYSTEM_REDIS_CONF);

redisSubscriber.setMaxListeners(50);
redisClient.setMaxListeners(50);
SystemRedisClient.setMaxListeners(50);
SystemRedisSubscriber.setMaxListeners(50);
export default { redisClient, redisSubscriber, SystemRedisClient, SystemRedisSubscriber, REDIS_CONF, SYSTEM_REDIS_CONF };
export  { redisClient, redisSubscriber, SystemRedisClient, SystemRedisSubscriber, REDIS_CONF, SYSTEM_REDIS_CONF };
