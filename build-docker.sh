docker run --rm -ti \
	--mount type=bind,source="$(pwd)",target=/app \
	-w=/app \
	-u=$UID \
	node:lts-alpine \
	npm run build
	
