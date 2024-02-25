# Drawpile Web Admin

This is a web-based administration interface for the dedicated [Drawpile](https://github.com/drawpile/Drawpile) server.

## Releases

You can find pre-built releases in [the GitHub Releases](https://github.com/drawpile/dpwebadmin/releases).

They each say which drawpile-srv version they are compatible with and what paths they were built with. If you want to use different paths you can't use them and must build this project yourself.

## Building

First, create a `.env.local` file with the following contents. If you want to use different paths, adjust them accordingly, `/admin/api` is the path under which drawpile-srv's admin interface is reachable, `/admin` is the path for the web admin interface itself.

```
REACT_APP_APIROOT=/admin/api
REACT_APP_BASENAME=/admin
PUBLIC_URL=/admin
```

Now you can build as follows:

* To build on Linux, macOS or similar Unix-ish systems, run `npm install`, then `NODE_OPTIONS=--openssl-legacy-provider npm run build`.
* To build on Windows, run `npm install`, then `/set NODE_OPTIONS=--openssl-legacy-provider`, then `npm run build`.
* To build with Docker, run `./build-docker.sh`. You may have to run it with `sudo`, depending on how you have Docker set up.

## Development

This project is built using Create React App, which has since been deprecated. It also has way too many dependencies, which makes upgrading very difficult and keeps triggering dependabot warnings.

No major development should be done on it anymore. It is instead supposed to be replaced with [drawpile-admin-webui](https://github.com/drawpile/drawpile-admin-webui). At the time of writing, that project only serves as an admin UI for the listserver.

To run a development server, first make sure you don't have an `.env.local` file laying around. Then use `NODE_OPTIONS=--openssl-legacy-provider npm run start`. It will automatically open a page in your browser to `http://localhost:3000/`. You should have a drawpile-srv running on the same machine with `--web-admin-port 27780` passed to it.

## License

This software is licensed under the MIT license, see [the LICENSE file](LICENSE) for details.

Earlier versions of this repository didn't include a license. This was merely an oversight, consider them released under the same license as well.
