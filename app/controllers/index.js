var account       = require('./account');
var user          = require('./user');
var ledger        = require('./ledger');
var transaction   = require('./transaction');
var person        = require('./person');
var participant   = require('./participant');
var currency      = require('./currency');
var amount        = require('./amount');
var common        = require('./common');
var qdb           = require('../lib/qdb');

function ctrl_wrap(ctrl) {
  return function(req, res) {
    return qdb.transaction(function(db) {
      return ctrl(req, db);
    }).
    then(function(json) {
      res.json(json);
    }).
    catch(common.handle(res));
  }
}

exports.init = function(app) {

app.param(function(name, fn) {
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        var val = captures[0];
        var n;
        if (val !== '' && !isNaN(n = Number(val))) {
          val = n;
        }
        req.params[name] = val;
        next();
      } else {
        next('route');
      }
    }
  }
});

function get(path, ctrl) {
  app.get(path, ctrl_wrap(ctrl));
}

function del(path, ctrl) {
  app.delete(path, ctrl_wrap(ctrl));
}

function put(path, ctrl) {
  app.put(path, ctrl_wrap(ctrl));
}

function pos(path, ctrl) {
  app.post(path, ctrl_wrap(ctrl));
}

// routes

// json api
//
// json post / cookie authentication endpoints
// these will always send custom www-authentication header because
// basic http authentication is not accepted. the reason for this is that
// we don't want web clients to authenticate automatically by sending
// credentials with http auth in case they have visited the api pages.

get     ('/api/account',                          account.account);
pos     ('/api/login',                            account.login);
get     ('/api/logout',                           account.logout);
pos     ('/api/signup',                           account.signup);
del     ('/api/account',                          account.delete_account);

// all /api/ requests from here on can be authenticated with basic http
// authentication

app.all     (/^\/api\//,                          common.require_auth);

app.param   ('id', /^\d+$/);
app.param   ('od', /^\d+$/);

get     ('/api/users',                            user.all);
get     ('/api/users/:id',                        user.get);
del     ('/api/users/:id',                        user.del);
get     ('/api/users/:id/ledgers',                user.ledgers);

get     ('/api/ledgers',                          ledger.all);
pos     ('/api/ledgers',                          ledger.pos);
get     ('/api/ledgers/summary',                  ledger.ledgers_summary);
get     ('/api/ledgers/:id',                      ledger.get);
del     ('/api/ledgers/:id',                      ledger.del);
put     ('/api/ledgers/:id',                      ledger.put);
get     ('/api/ledgers/:id/summary',              ledger.summary);
get     ('/api/ledgers/:id/balances',             ledger.balances);
get     ('/api/ledgers/:id/persons',              ledger.persons);
pos     ('/api/ledgers/:id/persons',              ledger.add_person);
get     ('/api/ledgers/:id/currencies',           ledger.currencies);
pos     ('/api/ledgers/:id/currencies',           ledger.add_currency);
get     ('/api/ledgers/:id/transactions',         ledger.transactions);
pos     ('/api/ledgers/:id/transactions',         ledger.add_transaction);
get     ('/api/ledgers/:id/transactions/summary', ledger.transactions_summary);
put     ('/api/ledgers/:id/owners/:od',           ledger.update_owner);

get     ('/api/transactions/:id',                 transaction.get);
del     ('/api/transactions/:id',                 transaction.del);
put     ('/api/transactions/:id',                 transaction.put);
pos     ('/api/transactions/:id/amounts',         transaction.add_amount);
put     ('/api/transactions/:id/summary',         transaction.update_summary);
pos     ('/api/transactions/:id/participants',    transaction.add_participant);
get     ('/api/transactions/:id/participants',    transaction.participants);

get     ('/api/persons/:id',                      person.get);
del     ('/api/persons/:id',                      person.del);
put     ('/api/persons/:id',                      person.put);

get     ('/api/participants/:id',                 participant.get);
del     ('/api/participants/:id',                 participant.del);
put     ('/api/participants/:id',                 participant.put);

get     ('/api/currencies/:id',                   currency.get);
del     ('/api/currencies/:id',                   currency.del);
put     ('/api/currencies/:id',                   currency.put);

get     ('/api/amounts/:id',                      amount.get);
del     ('/api/amounts/:id',                      amount.del);
put     ('/api/amounts/:id',                      amount.put);

};
