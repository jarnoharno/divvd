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

req.post = function(path, opts) {
  var base = {
    method: 'POST',
    body: {}
  };
  if (opts) {
    util.extend(base, opts);
  }
  return req(path, base);
}

req.login = function(username, password, jar) {
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
  return req.post('/api/login', opts);
}

req.logout = function(jar) {
  return req.get('/api/logout', jar);
}

req.account = function(jar) {
  return req.get('/api/account', jar);
}
