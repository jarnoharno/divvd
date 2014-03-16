// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

// logging
app.use(logfmt.requestLogger());

// static file server
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.send('Hello World!');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
