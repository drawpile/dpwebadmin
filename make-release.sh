#!/bin/sh
# SPDX-License-Identifier: MIT
# Release checklist:
# * Bump version in package.json
# * Run ./make-release.sh, which will also update package-lock.json
# * git add package.json package-lock.json
# * git commit -m "Bump version to x.y.z"
# * git push
# * git tag -sm "Release x.y.z" x.y.z
# * git push origin x.y.z
set -e
cd "$(dirname "$0")"

version="$(jq -r <package.json .version)"
if [ -z "$version" ]; then
    echo "Failed to retrieve version" 2>&1
    exit 1
fi

echo "Building release for dpwebadmin-$version"
set -x

echo 'REACT_APP_APIROOT=/admin/api
REACT_APP_BASENAME=/admin
PUBLIC_URL=/admin' >.env.local

rm -rf build node_modules "dpwebadmin-$version" "dpwebadmin-$version.tar.gz"
./build-docker.sh

mv build "dpwebadmin-$version"
tar czf "dpwebadmin-$version.tar.gz" "dpwebadmin-$version" \
    --owner=0 --group=0 --no-same-owner --no-same-permissions --numeric-owner

tar tvf "dpwebadmin-$version.tar.gz"

set +x
echo "Done building release for dpwebadmin-$version"
