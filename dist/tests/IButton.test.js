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
const chai_1 = require("chai");
const Redis_1 = require("../Redis");
const IButton_1 = require("../IButton");
console.log("Begin unit testing");
describe('IButton Tests', () => {
    const TIMEOUT = 60000;
    let watcher;
    let callbacks = {};
    // set up watcher
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("setting up watcher");
            watcher = yield IButton_1.onIButtonChange((update) => {
                console.log("iButton update:", update);
                for (let key in callbacks) {
                    callbacks[key](update);
                }
            }, (error) => { throw error; });
        });
    });
    it('detect UNAUTHORIZED ibutton', function (done) {
        console.log("INSERT UNAUTHORIZED IBUTTON...");
        this.timeout(TIMEOUT);
        // register callback
        callbacks['unauthorized'] = function (update) {
            chai_1.expect(update.connected.id).to.exist;
            chai_1.expect(update.connected.whitelisted).to.be.false;
            delete callbacks['unauthorized'];
            done();
        };
    });
    it('detect AUTHORIZED ibutton', function (done) {
        console.log("INSERT AUTHORIZED IBUTTON...");
        this.timeout(TIMEOUT);
        // register callback
        callbacks['authorized'] = function (update) {
            chai_1.expect(update.authorized.connected.id).to.exist;
            delete callbacks['authorized'];
            done();
        };
    });
    // cleanup
    after(function () {
        console.log('deregistering watcher');
        watcher.off();
        Redis_1.disconnectAll();
    });
});
