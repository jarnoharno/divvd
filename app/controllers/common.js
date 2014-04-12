var Hox = require('../lib/hox');
var auth = require('basic-auth');
var user = require('../dao/user');
var Promise = require('bluebird');

var common = module.exports = {}

common.basic_http = function(req, res, next) {
  Promise.try(function() {
    if (req.session.user) {
      return;
    }
    var body = auth(req);
    if (!body) {
      return;
    }
    return user.find_username_and_password(body).
    then(function(usr) {
      req.session.user = usr;
    }).
    catch(function() {
      // ignore errors
    });
  }).
  finally(function() {
    next();
  });
};

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

common.require_authentication = function(req, res, next) {

  // used in error handling
  res.basic_auth = !!(req.query && req.query.auth === 'basic');

  if (req.session.user) {
    next();
    return;
  }
  Promise.try(function() {
    return common.parse_basic_auth(req);
  }).
  then(function(credentials) {
    console.log(credentials);
    return user.find_username_and_password(credentials);
  }).
  then(function(usr) {
    req.session.user = usr;
    next();
  }).
  catch(common.handle(res));
};

common.is_logged = function(req) {
  return !!req.session.user;
};

common.error = function(res, err) {
  console.error(err.message);
  res.json(500, { message: err.message });
};

common.handle = function(res, auth) {
  return function(err) {
    if (err instanceof Hox) {
      if (err.code == 500) {
        console.error(err.stack);
      }
      err.send(res, auth);
    } else {
      console.error(err.stack);
      res.json(500, { message: "server error" });
    }
  }
}
