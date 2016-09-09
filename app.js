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

var authenticate = jwt({
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
app.use("/adrock/secure", authenticate);

//Uploading apps
app.use("/adrock/secure/upload", post);

//Server
var port = process.env.PORT || 3001;

app.listen(port, "localhost", function () {
  console.log("\\o/");
});
