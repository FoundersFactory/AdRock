const fs = require("fs");

//Getting apps
module.exports = function(app) {
	app.get("/adrock", function (req, res) 
	{
		function error() {
			res.sendStatus(404);
		}
		
		var path = null;
		try {
			path = req.originalUrl.toLowerCase().split("/")[0];
		} catch (e) {
			error();
		}
		
		if (path == null) {
			error();
			return;
		}
		
		path = "./apps/" + path + "/index.html";
		
		fs.stat(path, function(err, stats) {
			if (err == null || err == undefined) {
				res.render(path);
				return;
			}
			
			error();
		});
	});
};