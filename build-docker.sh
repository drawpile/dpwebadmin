#!/bin/sh
docker run --rm -ti \
	--mount type=bind,source="$(pwd)",target=/app \
	-w=/app \
	-u=$UID \
	-e 'NODE_OPTIONS=--openssl-legacy-provider' \
	node:lts-alpine \
	/bin/sh -c "npm install --no-progress && npm run build"
