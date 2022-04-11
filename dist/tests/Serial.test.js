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
//import { describe } from 'mocha';
const Redis_1 = require("../Redis");
const Serial_1 = require("../Serial");
console.log("Begin unit testing");
/**
describe('Fatigue Tests', () => {
    const TIMEOUT = 60000

    let watcher: any
    let callbacks = {}

    // set up watcher
    before(async function () {
        console.log("setting up watcher")
        watcher = onFatigueEvent(
            (update) => {
                for (let key in callbacks) {
                    callbacks[key](update)
                }
            },
            (error) => { throw error }
        )
    })

    it('detect fatigue event', function (done) {
        this.timeout(TIMEOUT)
        // register callback
        callbacks['$callback'] = function (update) {
            console.log(update)
            // expect(update[""]).to.exist
            // delete callbacks['$callback']
            // done()
        }
    });

    // cleanup
    after(function () {
        console.log('deregistering watcher')
        watcher.off()
        disconnectAll()
    })
}); */
describe('RFID Tests', () => {
    const TIMEOUT = 60000;
    let watcher;
    let callbacks = {};
    // set up watcher
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("setting up watcher");
            watcher = yield Serial_1.onRFIDEvent((update) => {
                console.log("RFID update:", update);
                for (let key in callbacks) {
                    callbacks[key](update);
                }
            }, (error) => { throw error; });
        });
    });
    it('detect RFID event', function (done) {
        this.timeout(TIMEOUT);
        // register callback
        callbacks['$callback'] = function (update) {
            console.log(update);
            // expect(update[""]).to.exist
            // delete callbacks['$callback']
            // done()
        };
    });
    // cleanup
    after(function () {
        console.log('deregistering watcher');
        watcher.off();
        Redis_1.disconnectAll();
    });
});
