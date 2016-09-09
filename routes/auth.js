var jwt = require("express-jwt");

var jwtCheck = jwt({
	secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
	audience: process.env.AUTH0_CLIENT_ID
});

//Auth
module.exports = jwtCheck;
