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
const Utils_1 = require("./Utils");
const Redis = require("ioredis");
/**
 * System module get information about ApexOS
 * @module System-Info
 */
/**
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
    return Utils_1.default.OSExecute("apx-about");
}
function modem() {
    return __awaiter(this, void 0, void 0, function* () {
        var reader = new Redis();
        var response = yield reader.hgetall("modem_information");
        reader = null;
        return response;
    });
}
exports.default = { info, modem };
