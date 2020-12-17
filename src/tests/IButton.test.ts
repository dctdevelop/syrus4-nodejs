import { expect } from 'chai';

import { disconnectAll } from '../Redis'
import { onIButtonChange } from '../Ibutton'

console.log("Begin unit testing")

describe('IButton Tests', () => {
	const TIMEOUT = 60000

	let watcher: any
	let callbacks = {}

	// set up watcher
	before(async function (){
		console.log("setting up watcher")
		watcher = await onIButtonChange(
			(ib_event) => {
				console.log("received iButton", ib_event)
				for( let key in callbacks ){
					callbacks[key](ib_event)
				}
			},
			(error) => { throw error }
		)
	})

	it('detect ibutton', function (done){
		this.timeout(TIMEOUT)
		// register callback
		callbacks['connected'] = function(ib_event){
			expect(ib_event.connected.id).to.exist
			delete callbacks['connected']
			done()
		}
	});
	it('detect authorized ibutton', function (done) {
		this.timeout(TIMEOUT)
		// register callback
		callbacks['authorized'] = function (ib_event) {
			expect(ib_event.authorized.connected.id).to.exist
			delete callbacks['authorized']
			done()
		}
	});

	// cleanup
	after(function(){
		console.log('deregistering watcher')
		watcher.off()
		disconnectAll()
	})
});
