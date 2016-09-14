const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("express-jwt");
const cors = require("cors");

dotenv.load();

const authenticate = jwt({
	secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
	audience: process.env.AUTH0_CLIENT_ID
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

//Server
const port = process.env.PORT || 3001;

app.listen(port, process.env.HOST || "localhost", function () {
	console.log("\\o/");
});
