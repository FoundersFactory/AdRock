var express = require("express");
var app = express();

//Getting apps
require("./adrock/get.js")(app);

//Uploading apps
require("./adrock/post.js")(app);

//Auth
require("./adrock/auth.js")(app);

//Server
app.listen(3000, "localhost", function () {
  console.log("Example app listening on port 3000!");
});
