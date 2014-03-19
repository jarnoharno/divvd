
/**
 * Module dependencies.
 */

var express = require('express');
var db = require('./db');
var user = require('./controllers/user');
var http = require('http');
var path = require('path');
var auth = require('./auth');

var app = express();

// all environments
db.init(process.env.DATABASE_URL);
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(process.env.SECRET || 'mydirtylittlesecret'));
app.use(express.session());
app.use(auth);

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.param('user', user.param.user);
app.get('/api/user/:user', user.user);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
