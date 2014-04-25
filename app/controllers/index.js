var amount = require('./amount');
var common = require('./common');
//var Promise = require('bluebird');

function ctrl_wrap(ctrl) {
  return function(req, res) {
    ctrl(req).
    then(function(json) {
      res.json(json);
    }).
    catch(common.handle(res));
  }
}

exports.init = function(app) {

function get(path, ctrl) {
  app.get(path, ctrl_wrap(ctrl));
}

function del(path, ctrl) {
  app.delete(path, ctrl_wrap(ctrl));
}

function put(path, ctrl) {
  app.put(path, ctrl_wrap(ctrl));
}

// routes

get     ('/api/amounts/:amount', amount.get);
del     ('/api/amounts/:amount', amount.del);
put     ('/api/amounts/:amount', amount.put);

};
