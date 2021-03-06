import { expect } from 'chai';

import { disconnectAll } from '../Redis'
import { onFatigueEvent } from '../Serial'

console.log("Begin unit testing")

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
});
