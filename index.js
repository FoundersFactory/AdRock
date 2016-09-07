var express = require('express');
var app = express();

app.get('/adrock', function (req, res) {
  res.send('Hello World!');
});

app.disable('x-powered-by');

app.listen(3000, 'localhost', function () {
  console.log('Example app listening on port 3000!');
});