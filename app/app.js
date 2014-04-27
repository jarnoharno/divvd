var express     = require('express');
var http        = require('http');
var path        = require('path');
var redirect    = require('./lib/redirect');
var user        = require('./controllers/user');
var account     = require('./controllers/account');
var ledger      = require('./controllers/ledger');
var currency    = require('./controllers/currency');
var person      = require('./controllers/person');
var transaction = require('./controllers/transaction');
var participant = require('./controllers/participant');
var amount      = require('./controllers/amount');
var common      = require('./controllers/common');
var db          = require('./lib/qdb');
var controllers = require('./controllers');

var app = express();

db.init(process.env.DATABASE_URL);

app.set('port', process.env.PORT || 80);
app.enable('trust proxy');
app.disable('x-powered-by');

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
}
app.use(express.favicon());
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public/nonsecure')));

// secure connection required from here on

app.use(redirect(process.env.SSL_PORT || 443));
app.use(express.json());
app.use(function(err, req, res, next) {
  // invalid json handling
  res.json(400, { message: err.toString() });
});
app.use(express.urlencoded());
app.use(express.cookieParser(process.env.SECRET || 'mydirtylittlesecret'));
app.use(express.session({
  cookie: {
    httpOnly: true,
    secure: true
  },
  key: 'sid',
  proxy: true
}));

// init routes

app.use(app.router);
controllers.init(app);

// static secure content

app.use(express.static(path.join(__dirname, 'public/secure')));

// serve root for all unrecognized routes
// this is necessary for angular routing to work

app.use(function(req, res, next) {
  if (req.method == 'GET') {
    res.sendfile(path.join(__dirname, 'public/secure/index.html'));
  } else {
    res.set('Allow', 'GET');
    res.json(405, { message: 'not allowed' });
  }
});

// handle errors thrown outside controllers (which should be handled with
// promises)

app.use(function(err, req, res, next) {
  console.error('express error handler');
  common.handle(res)(err);
});

// launch server

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
