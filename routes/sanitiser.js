module.exports = {
	post: function(req, callback) {
		if (req.path == null || req.path.length == 0 || req.path === "/") {
			callback("");
			return;
		}
		callback(null);
	},
	get: function(req, callback) {
		var result = null;
		
		console.log(req.param);
		console.log(req.param("bundleId"));
		console.log(req.param("version"));
		
		if (req.query.length > 0) {
			callback(result);
			return;
		}
		
		try {
			result = req.path.toLowerCase();
		} catch (e) {
			//Noop
		} finally {
			callback(result);
		}
	},
	rootPath: "./apps"
};