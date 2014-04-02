var Q = require('q');
var request = require('request');
var util = require('./util');

Q.longStackSupport = true;

module.exports = req;

function req(path, opts) {
  var base = {
    url: 'https://localhost:4000' + path,
    json: true,
    strictSSL: false,
    followRedirect: false
  };
  if (opts) {
    util.extend(base, opts);
  }
  return function() {
    var deferred = Q.defer();
    request(base, function(err, res, body) {
      deferred.resolve([err, res, body]);
    });
    return deferred.promise;
  };
};

req.get = function(path, jar) {
  var opts = {
    method: 'GET'
  };
  if (jar) {
    opts.jar = jar;
  }
  return req(path, opts);
}

req.body = function(method, path, opts) {
  var base = {
    method: method,
    body: {}
  };
  if (opts) {
    util.extend(base, opts);
  }
  return req(path, base);
}

req.delete = function(path, opts) {
  return req.body('DELETE', path, opts);
}

req.post = function(path, opts) {
  return req.body('POST', path, opts);
}

req.auth_json = function(path, username, password, jar) {
  var opts = {
    body: {
      username: 'test',
      password: 'test'
    }
  };
  if (username && typeof username !== 'string') {
    jar = username;
    opts.jar = jar;
  } else if (username && password) {
    opts.body.username = username;
    opts.body.password = password;
    if (jar) {
      opts.jar = jar;
    }
  }
  return req.post(path, opts);
}

req.login = function(username, password, jar) {
  return req.auth_json('/api/login', username, password, jar);
}

req.signup = function(username, password, jar) {
  return req.auth_json('/api/signup', username, password, jar);
}

req.logout = function(jar) {
  return req.get('/api/logout', jar);
}

req.account = function(jar) {
  return req.get('/api/account', jar);
}

req.delete_account = function(jar) {
  var opts = {};
  if (jar) {
    opts.jar = jar;
  }
  return req.delete('/api/account', opts);
}
