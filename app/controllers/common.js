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
      username: body.user,
      password: body.pass
    };
  } else {
    throw new Hox(401, 'unauthenticated');
  }
}

common.require_authentication = function(req, res, next) {
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
  });
};

common.requireAuthCustom = function(req, res, auth_hidden) {
  res.statusCode = 401;
  // Browsers will only generate default auth dialog when WWW-Authenticate
  // method is either 'Basic' or 'Digest'. From web clients we can suppress
  // this by attaching ?error=hidden querystring to requests.
  if (auth_hidden) {
    res.setHeader('WWW-Authenticate', 'Custom realm="Authorization Required"');
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"');
  }
  res.json({ message: 'unauthorized' });
};

common.requireAuth = function(req, res) {
  exports.requireAuthCustom(req, res, req.query && req.query.auth === 'hidden');
};

common.isLogged = function(req) {
  return !!req.session.user;
};

common.error = function(res, err) {
  console.error(err.message);
  res.json(500, { message: err.message });
};

common.handle = function(res, hidden_auth) {
  return function(err) {
    if (err instanceof Hox) {
      err.send(res, hidden_auth);
    } else {
      res.json(500, { message: "server error" });
    }
  }
}
