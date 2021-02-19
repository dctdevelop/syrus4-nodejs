import { expect } from 'chai';

import { disconnectAll } from '../Redis'
import { watchECUParams } from '../ECU'

console.log("Begin unit testing")

describe('TPMS Tests', () => {
	const TIMEOUT = 60000

	let watcher: any
	let callbacks = {}

	// set up watcher
	before(async function () {
		console.log("setting up watcher")
		watcher = watchECUParams(
			(update) => {
				for (let key in callbacks) {
					callbacks[key](update)
				}
			},
			(error) => { throw error }
		)
	})

	it('detect tpms', function (done) {
		this.timeout(TIMEOUT)
		// register callback
		callbacks['$callback'] = function (update) {
			let filter = {}
			for (const key in update){
				if (
					key.startsWith('fef4') ||
					key.startsWith('tires_') ||
					key.startsWith('$tires.')
				){
					filter[key] = update[key]
				}
			}
			console.log(filter)
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
