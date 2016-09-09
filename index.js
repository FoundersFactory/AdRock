const express = require("express");
const app = express();

//Getting apps
require("./config/get.js")(app);

//Uploading apps
require("./config/post.js")(app);

//Auth
require("./config/auth.js")(app);

//Server
app.listen(3000, "localhost", function () {
  console.log("\o/");
});
