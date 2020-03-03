/**
 * IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
 * TODO: implement this
 * @module IOS
 */
var Redis = require("ioredis");
var redis = new Redis();
var notis = new Redis();
/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName, cb, errorCallback) {
    if (inputName === void 0) { inputName = "IGN"; }
    var channel = "interface/input/" + inputName;
    if (inputName[0] == "O") {
        channel = "interface/output/" + inputName;
    }
    if (inputName[0] == "A") {
        channel = "interface/analog/" + inputName;
    }
    var callback = function (_pattern, channel, raw) {
        var input = channel.split("/")[2];
        if (input == inputName) {
            var returnable = raw;
            if (raw == "true")
                returnable = true;
            if (raw == "false")
                returnable = false;
            cb(returnable);
        }
    };
    // console.log("channel name:", channel);
    notis.psubscribe(channel);
    notis.on("pmessage", callback);
    return {
        unsubscribe: function () {
            notis.off("" + channel, callback);
        }
    };
}
/**
 * get a promise that resolve the current input or output state
 * @param inputName the input/output requested
 */
function getInputState(inputName) {
    if (inputName === void 0) { inputName = "IGN"; }
    var channel = "current_input_state";
    if (inputName[0] == "O") {
        channel = "current_output_state";
    }
    if (inputName[0] == "A") {
        channel = "current_analog_state";
    }
    return new Promise(async(resolve, reject), {
        var: response = await, redis: .hget(channel, inputName),
        var: returnable, any:  = response,
        if: function (response) {
            if (response === void 0) { response =  == "true"; }
        }, returnable:  = true,
        if: function (response) {
            if (response === void 0) { response =  == "false"; }
        }, returnable:  = false,
        resolve: function (returnable) { }
    });
}
/**
 * Allow to change the state of an output
 * @param inputName the output to change state
 * @param state the new state  of the output
 */
function setOutputState(inputName, state) {
    if (inputName === void 0) { inputName = "OUT1"; }
    if (state === void 0) { state = true; }
    return new Promise(function (resolve, reject) {
        redis.hset("desired_output_state", inputName, "" + state);
        notis.publish("desired/interface/output/" + inputName, "" + state);
        resolve(state);
    });
}
/**
 * Get the current state of all inputs, outputs and analogs in the Syrus4 device
 */
async;
function getAll() {
    var inputs = (await), redis, hgetall = ("current_input_state");
     || {};
    var outputs = (await), redis, hgetall = ("current_output_state");
     || {};
    var analogs = (await), redis, hgetall = ("current_analog_state");
     || {};
    var response = Object.assign(inputs, outputs);
    response = Object.assign(response, analogs);
    Object.keys(response).forEach(function (key) {
        if (response[key] == "true")
            response[key] = true;
        if (response[key] == "false")
            response[key] = false;
        if (parseFloat(response[key]))
            response[key] = parseFloat(response[key]);
    });
    return response;
}
exports.default = {
    watchInputState: watchInputState,
    getInputState: getInputState,
    setOutputState: setOutputState,
    getAll: getAll
};
