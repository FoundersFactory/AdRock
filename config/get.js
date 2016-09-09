const fs = require("fs");
const sanitiser = require("./sanitiser.js");

//Getting apps
module.exports = function(app) {
	app.get("/adrock", function(req, res) 
	{
		var error = function() {
			res.sendStatus(404);
		}
		
		sanitiser.sanitise(req, function(path) {
			if (path == null) path = "index.html";
			
			path = sanitiser.rootPath + "/" + path;
			
			fs.stat(path, function(err, stats) {
				if (err == null || err == undefined) {
					res.status(200).send(path);
					return;
				}
				
				error();
			});
		});
	});
};