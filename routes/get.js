const router = require("express").Router(); 
const fs = require("fs");
const sanitiser = require("./sanitiser.js");

//Getting apps
router.get("/:bundleId?/:platform?/:version?/:file?", function(req, res) 
{
	let error = function() {
		res.status(404).send("We couldn't find your app... :(");
	}
	
	sanitiser.get(req, function(path) {
		if (path == null) {
			error();
			return;
		}
		
		let sendFile = true;
		if (path.indexOf(".html") !== -1) {
			path = "./apps/" + path;
			sendFile = false;
		} else {
			path = "/home/node/Server/apps/" + path;
		}
		
		fs.stat(path, function(e, stats) {
			if (e) {
				console.log("ERROR: get(/adrock) + getting stuff -> " + e + "\nAt Path: " + req.path);
				error();
				return;
			}
			
			if (!sendFile) {
				res.status(200).send(fs.readFileSync(path, "utf8"));
				return;
			}
			
			res.status(200).sendFile(path);
		});
	});
});

module.exports = router;