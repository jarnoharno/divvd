var Hox = require('../lib/hox');
var auth = require('basic-auth');
var user = require('../dao/user');
var Promise = require('bluebird');

var common = module.exports = {}

common.parse_basic_auth = function(req) {
  var body = auth(req);
  if (body) {
    return {
      username: body.name,
      password: body.pass
    };
  } else {
    throw new Hox(401, 'unauthenticated');
  }
}

common.require_auth = function(req, res, next) {
  // used in 401 error reporting in lib/hox.js
  res.basic_auth = req.params.auth === 'basic';
  if (req.session.user) {
    next();
    return;
  }
  Promise.try(function() {
    return common.parse_basic_auth(req);
  }).
  then(function(credentials) {
    return user.find_username_and_password(credentials);
  }).
  then(function(usr) {
    req.session.user = usr;
    next();
  }).
  catch(common.handle(res));
};

common.error = function(res, err) {
  res.json(500, { message: err.message });
};

common.handle = function(res) {
  return function(err) {
    if (err instanceof Hox) {
      if (err.code == 500) {
        console.error(err.stack);
      }
      err.send(res);
    } else {
      console.error(err.stack);
      res.json(500, { message: "server error" });
    }
  }
}
