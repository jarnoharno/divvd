var express   = require('express');
var http      = require('http');
var path      = require('path');
var redirect  = require('./lib/redirect');
var user      = require('./controllers/user');
var account   = require('./controllers/account');
var ledger    = require('./controllers/ledger');
var common    = require('./controllers/common');
var db        = require('./lib/qdb');

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

// secure connection required from this line on
app.use(redirect(process.env.SSL_PORT || 443));
app.use(express.json());
app.use(function(err, req, res, next) {
  // invalid json
  res.json(400, { message: err.toString() });
});
app.use(express.urlencoded());
app.use(express.cookieParser(process.env.SECRET || 'mydirtylittlesecret'));
app.use(express.session({cookie: { secure: true }, proxy: true}));

app.use(app.router);

// json api
//
// json post / cookie authentication endpoints
// these will always send custom www-authentication header because
// basic http authentication is not accepted. the reason for this is that
// we don't want web clients to authenticate automatically by sending
// credentials with http auth in case they have visited the api pages.
app.get('/api/account', account.account);
app.post('/api/login', account.login);
app.get('/api/logout', account.logout);
app.post('/api/signup', account.signup);
app.delete('/api/account', account.delete_account);

// all /api/ requests from here on can be authenticated with basic http
// authentication
app.all(/^\/api\//, common.require_authentication);
app.param('user', user.param.user);
app.get('/api/users', user.users);
app.get('/api/users/:user', user.user);
app.get('/api/users/:user/ledgers', user.ledgers);
app.delete('/api/users/:user', user.delete);

app.param('ledger', ledger.param.ledger);
app.post('/api/ledgers', ledger.create_ledger);
app.get('/api/ledgers', ledger.ledgers);
app.get('/api/ledgers/:ledger', ledger.ledger);

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
app.use(function(err, req, res, next) {
  // error happened somewhere else than inside controllers which should always
  // use promises
  console.error('express error handler');
  common.handle(res)(err);
});

// launch server
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
