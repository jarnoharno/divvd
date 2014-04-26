var ledger        = require('./ledger');
var transaction   = require('./transaction');
var person        = require('./participant');
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

function par(path, f) {
  app.param(path, f);
}

// routes

par     ('id', /^\d+$/);

pos     ('/api/ledgers/:id/persons', ledger.add_person);

get     ('/api/ledgers/:id/currencies', ledger.currencies);
get     ('/api/ledgers/:id/persons', ledger.persons);

pos     ('/api/transactions/:id/amounts', transaction.add_amount);
pos     ('/api/transactions/:id/participants', transaction.add_participant);

get     ('/api/persons/:id', person.get);
del     ('/api/persons/:id', person.del);
put     ('/api/persons/:id', person.put);

get     ('/api/participants/:id', participant.get);
del     ('/api/participants/:id', participant.del);
put     ('/api/participants/:id', participant.put);

get     ('/api/currencies/:id', currency.get);
del     ('/api/currencies/:id', currency.del);
put     ('/api/currencies/:id', currency.put);

get     ('/api/amounts/:id', amount.get);
del     ('/api/amounts/:id', amount.del);
put     ('/api/amounts/:id', amount.put);

};
