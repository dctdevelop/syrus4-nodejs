import { AssertionError, expect } from 'chai';

import { disconnectAll } from '../Redis'
import { onIButtonChange, IButtonUpdate } from '../IButton'

console.log("Begin unit testing")

describe('IButton Tests', () => {
	const TIMEOUT = 60000

	let watcher: any
	let callbacks = {}

	// set up watcher
	before(async function (){
		console.log("setting up watcher")
		watcher = await onIButtonChange(
			(update) => {
				console.log("iButton update:", update)
				for( let key in callbacks ){
					callbacks[key](update)
				}
			},
			(error) => { throw error }
		)
	})

	it('detect UNAUTHORIZED ibutton', function (done){
		console.log("INSERT UNAUTHORIZED IBUTTON...")
		this.timeout(TIMEOUT)
		// register callback
		callbacks['unauthorized'] = function (update: IButtonUpdate){
			expect(update.connected.id).to.exist
			expect(update.connected.whitelisted).to.be.false
			delete callbacks['unauthorized']
			done()
		}
	});
	it('detect AUTHORIZED ibutton', function (done) {
		console.log("INSERT AUTHORIZED IBUTTON...")
		this.timeout(TIMEOUT)
		// register callback
		callbacks['authorized'] = function (update: IButtonUpdate) {
			expect(update.authorized.connected.id).to.exist
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
