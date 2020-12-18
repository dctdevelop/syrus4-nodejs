#! /bin/bash

rsync -e 'ssh -p 2222' \
	-avz \
	--delete \
	--exclude=.git \
	--exclude=.env \
	--exclude=node_modules \
	. syrus4g@$1:/data/downloads/syrus4g-nodejs
