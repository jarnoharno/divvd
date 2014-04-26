var amount = require('./amount');
var common = require('./common');
var qdb = require('../lib/qdb');
var Promise = require('bluebird');

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

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures[0];
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

function par(path, f) {
  app.param(path, f);
}

// routes

par     ('amount_id', /^\d+$/);
get     ('/api/amounts/:amount_id', amount.get);
del     ('/api/amounts/:amount_id', amount.del);
put     ('/api/amounts/:amount_id', amount.put);

};
