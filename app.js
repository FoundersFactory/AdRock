const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("express-jwt");
const cors = require("cors");
const http = require("http");

dotenv.load();

const get = require("./routes/get");
const post = require("./routes/post");

const authenticate = jwt({
	secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
	audience: process.env.AUTH0_CLIENT_ID
});

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Getting apps
app.use("/adrock", get);

//Auth
app.use("/adrock/upload", authenticate);

//Uploading apps
app.use("/adrock/upload", post);
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).send('Invalid token...');
		return;
	}
	next(err);
});

//Server
const port = process.env.PORT || 3001;

app.listen(port, process.env.HOST || "localhost", function () {
	console.log("\\o/");
});
