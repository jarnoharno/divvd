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

app.use(app.router);

// json api
//
// json post / cookie authentication endpoints
// these will always send custom www-authentication header because
// basic http authentication is not accepted. the reason for this is that
// we don't want web clients to authenticate automatically by sending
// credentials with http auth in case they have visited the api pages.

app.get     ('/api/account',                      account.account);
app.post    ('/api/login',                        account.login);
app.get     ('/api/logout',                       account.logout);
app.post    ('/api/signup',                       account.signup);
app.delete  ('/api/account',                      account.delete_account);

// all /api/ requests from here on can be authenticated with basic http
// authentication

app.all     (/^\/api\//,                          common.require_authentication);
app.param   ('user',                              user.param.user);
app.get     ('/api/users',                        user.users);
app.get     ('/api/users/:user',                  user.user);
app.delete  ('/api/users/:user',                  user.delete);
app.get     ('/api/users/:user/ledgers',          user.ledgers);

app.param   ('ledger',                            ledger.param.ledger);
app.get     ('/api/ledgers',                      ledger.ledgers);
app.post    ('/api/ledgers',                      ledger.create);
app.get     ('/api/ledgers/summary',              ledger.ledgers_summary);
app.get     ('/api/ledgers/:ledger',              ledger.ledger);
app.delete  ('/api/ledgers/:ledger',              ledger.delete);
app.put     ('/api/ledgers/:ledger',              ledger.update);
app.get     ('/api/ledgers/:ledger/summary',      ledger.summary);
app.get     ('/api/ledgers/:ledger/balances',     ledger.balances);
app.get     ('/api/ledgers/:ledger/currencies',   ledger.currencies);
app.post    ('/api/ledgers/:ledger/currencies',   ledger.add_currency);
app.get     ('/api/ledgers/:ledger/persons',      ledger.persons);
app.post    ('/api/ledgers/:ledger/persons',      ledger.add_person);
app.get     ('/api/ledgers/:ledger/transactions', ledger.transactions);
app.post    ('/api/ledgers/:ledger/transactions', ledger.add_transaction);
app.get			('/api/ledgers/:ledger/transactions/summary',
																									ledger.transactions_summary);
app.param   ('o',                                 ledger.param.owner);
app.put     ('/api/ledgers/:ledger/owners/:o',    ledger.update_owner);

app.param   ('currency',                          currency.param);
app.get     ('/api/currencies/:currency',         currency.get);
app.delete  ('/api/currencies/:currency',         currency.delete);
app.put     ('/api/currencies/:currency',         currency.put);

app.param   ('person',                            person.param);
app.get     ('/api/persons/:person',              person.get);
app.delete  ('/api/persons/:person',              person.delete);
app.put     ('/api/persons/:person',              person.put);

app.param   ('t',                                 transaction.param);
app.get     ('/api/transactions/:t',              transaction.get);
app.delete  ('/api/transactions/:t',              transaction.delete);
app.put     ('/api/transactions/:t',              transaction.put);
app.post    ('/api/transactions/:t/amounts',      transaction.add_amount);
app.put			('/api/transactions/:t/summary',			transaction.update_summary);
app.get     ('/api/transactions/:t/participants', transaction.participants);
app.post    ('/api/transactions/:t/participants', transaction.add_participant);

app.param   ('p',                                 participant.param);
app.get     ('/api/participants/:p',              participant.get);
app.delete  ('/api/participants/:p',              participant.delete);
app.put     ('/api/participants/:p',              participant.put);

app.param   ('amount',                            amount.param);
//app.get     ('/api/amounts/:amount',              amount.get);
//app.delete  ('/api/amounts/:amount',              amount.delete);
//app.put     ('/api/amounts/:amount',              amount.put);

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
