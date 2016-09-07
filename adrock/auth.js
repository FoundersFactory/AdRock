var jwt = require("express-jwt");

//Auth
module.exports = function(app) {
	var jwtCheck = jwt({
	  secret: new Buffer('1KZw3zZzTfJQLIIr5EzsXe-TdOfzGkeA9cUeYpgxMc8-SxqvmEckbC-hqlaVyjZy', 'base64'),
	  audience: 'pZBruvJE4uwcUKvZkAlKOwlIqt56aV9j'
	});
	
	app.use("/adrock/upload", jwtCheck);
};