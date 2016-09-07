var express = require('express');
var app = express();

app.get('/adrock', function (req, res) {
  res.send('Hello World!');
});

app.use(function (req, res, next) {
  res.header("X-Powered-By", "Bells and whistles");
  next();
});

app.listen(3000, 'localhost', function () {
  console.log('Example app listening on port 3000!');
});