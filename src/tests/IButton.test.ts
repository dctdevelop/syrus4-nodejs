import { expect } from 'chai';

import { onIButtonChange } from '../Ibutton'

describe('IButton Test', () => {
	it('detecting ibutton', async () => {
		// prompt for ibutton to look for
		// set up watcher
		let watcher = await onIButtonChange(
			(ib_event)=>{
				console.log("received iButton", ib_event)
				expect(ib_event.connected.id).to.be(process.env['IB_TEST'])
			},
			(error)=>{ throw error }
		)
		setTimeout(watcher.off, 30000)
	});
});
