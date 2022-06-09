"use strict";
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
    before(async function () {
        console.log("setting up watcher");
        watcher = await IButton_1.onIButtonChange((update) => {
            console.log("iButton update:", update);
            for (let key in callbacks) {
                callbacks[key](update);
            }
        }, (error) => { throw error; });
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
