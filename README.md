# AdRock

Rocking the AdHoc world! 🤘

## Requirements

* Node 4.3+
* Express 4.11+

## Setting up

* Cloning the repo:

`git clone https://github.com/FoundersFactory/AdRock.git`
* Installing Forever:

`npm install forever -g`
* Create a `.env` file:

`cd Server && touch .env`
* Log into [Auth0](https://www.auth0.com), create a Client for **AdRock** and configure the `.env` file with your info:

```
AUTH0_CLIENT_ID= 
AUTH0_CLIENT_SECRET= 
AUTH0_DOMAIN=<your-company-name>.eu.auth0.com 
AUTH0_CALLBACK_URL=http://localhost:3000/adrock
PORT=3000
HOST=localhost
EXTERNAL_URL=https://example.com
```

* Pulling changes and running the app (from `/Server`):

`forever stopall && git pull && npm install --save && \
NODE_ENV=production forever --minUptime 1000 --spinSleepTime 1000 start ./forever.json`

This will:

0. start the default `express` app on port `3000`
0. create a `GET <domain>/adrock/<full-app-bundle-id>` endpoint
0. create a `POST <domain>/adrock/upload` endpoint to receive apps

### Express

If you have an express app already and want to integrate **AdRock** to it:

```
//Requires
const dotenv = require("dotenv");
const jwt = require("express-jwt");
const cors = require("cors");

//Other stuff you might want to do
{...}

//Loading the environment variables and Auth0
dotenv.load();

const authenticate = jwt({
	secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
	audience: process.env.AUTH0_CLIENT_ID
});

//Other stuff you might want to do, especially creating your express app
{...}

//ADROCK!!!
//Getting apps
app.use("/adrock", require("./routes/get"));

//Auth
app.use("/adrock/upload", authenticate);

//Uploading apps
app.use("/adrock/upload", require("./routes/post"));
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).send('Invalid token...');
		return;
	}
	next(err);
});
```

### Nginx

If using Nginx, add this to your main `.conf` file:

```
location /adrock {
	include	/<path-to-adrock>/Server/nginx.conf;
}
```

## Using AdRock

To upload a new app or a new version for an existing app, you'll need to make a multipart-form `POST` request to `<domain>/adrock/upload` containing:

* Auth0's JWT
* (form field) `app` => an `.ipa` or `.apk` file of no more than 512mb in size
* `icon` => a `.png` file for the app's icon (only necessary on the first upload)
* `bundleId` => the app's full Bundle Id (eg. _com.example.raddest-app-ever_)
* `version` => The app's version (eg. _0.3.1_)
* `name` => The app's name (eg. _Raddest App Ever_)

Upon success, you'll get the URL for the app's `index.html`, which is the same as calling `<domain>/adrock/<full-app-bundle-id>`.

### Example:

```
	curl -X POST <domain>/adrock/upload \
		-H Authorization=Bearer <your-jwt>
		-F app=<path/to/ipa>
		-F icon=<path/to/icon>
		-F bundleId=<full-app-bundle-id>
		-F name='The App\'s Name'
		-F version=0.3.1
```
