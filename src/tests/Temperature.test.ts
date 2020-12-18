import { expect } from 'chai';

import { disconnectAll } from '../Redis'
import { onTemperatureChange, TemperatureUpdate } from '../Temperature'

console.log("Begin unit testing")

describe('Temperature Tests', function(){
	const TIMEOUT = 60000

	let watcher: any
	let last_update: TemperatureUpdate
	let callbacks = {}

	// set up watcher
	before(async function (){
		this.timeout(TIMEOUT)
		console.log("setting up watcher")
		watcher = await onTemperatureChange(
			(temp_event) => {
				last_update = temp_event
				console.log("received temperature update", temp_event)
				for( let key in callbacks ){
					callbacks[key](temp_event)
				}
			},
			(error) => { throw error }
		)
	})

	it('detect temperature', function (){
		expect(last_update.last.value).to.exist
	});

	it('detect aliased temperature', function () {
		expect(last_update.aliases['office'].value).to.exist
	});

	it('detect temperature update', function (done) {
		this.timeout(TIMEOUT)
		//register callback
		callbacks['update'] = function(update: TemperatureUpdate){
			expect(update.last.value).to.exist
			delete callbacks['update']
			done()
		}
		console.log("SEND TEMP UPDATE...")
	});

	// cleanup
	after(function(){
		console.log('deregistering watcher')
		watcher?.off()
		disconnectAll()
	})
});
