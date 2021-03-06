module.exports = {
	post: function(req, callback) {
		if (req.path == null || req.path.length == 0 || req.path === "/") {
			callback("");
			return;
		}
		callback(null);
	},
	get: function(req, callback) {
		let result = null;
		
		if (req.params == null || req.params.length == 0) {
			callback();
			return;
		}
		
		try {
			result = req.params["bundleId"].toLowerCase();
			result += "/" + req.params["platform"].toLowerCase();
		} catch (e) {
			console.log("ERROR: sanitiser + get -> " + e + "\nWith request: " + req);
			callback();
			return;
		}
		
		let version = req.params["version"];
		if (version == null || version.length == 0) {
			callback(result + "/index.html");
			return;
		}
		
		result += "/" + version.toLowerCase();
		
		let file = req.params["file"];
		if (file != null && file.length > 0 && file.indexOf(".") !== -1) {
			callback(result + "/" + file.toLowerCase());
			return;
		} else if (version.indexOf(".") !== -1) {
			callback(result);
			return;
		}
		
		callback();
	},
	rootPath: "./apps"
};