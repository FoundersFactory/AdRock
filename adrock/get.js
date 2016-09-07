//Getting apps
module.exports = function(app) {
	app.get("/adrock", function (req, res) {
	  res.send("Hello World!");
	});	
};