const router = require("express").Router(); 
const fs = require("fs");
const sanitiser = require("./sanitiser.js");

//Getting apps
router.get("/:bundleId/:version", function(req, res) 
{
	var error = function() {
		res.status(404).send("We couldn't find your app... :(");
	}
	
	sanitiser.get(req, function(path) {
		if (path == null) path = "index.html";
		
		path = sanitiser.rootPath + path;
		
		fs.stat(path, function(e, stats) {
			if (e == null || e == undefined) {
				res.status(200).send(path);
				return;
			}
			
			console.log("ERROR: get(/adrock) + getting stuff -> " + e + "\nAt Path: " + req.path);
			error();
		});
	});
});

module.exports = router;