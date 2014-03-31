var assert = require('assert');
var request = require('request');

// extend object

function extend(ret, base) {
  for (key in base) {
    if (base.hasOwnProperty(key)) {
      ret[key] = base[key];
    }
  }
}

// construct request options

function opts(base, extra) {
  var ret = {};
  extend(ret, base);
  extend(ret, extra);
  return ret;
}

// REST API test suite

describe('REST API', function() {
  var base = {
    url: 'https://localhost:4000',
    json: true,
    followRedirect: false,
    strictSSL: false
  };

  describe('/api/login', function() {

    // case specific options

    var cbase = opts(base, {
      url: base.url + '/api/login',
      method: 'POST'
    });

    // case specific request

    function req(extra, cb) {
      request(opts(cbase, extra), cb);
    }

    it('login', function(done) {
      req({
        body: {
          username: 'test',
          password: 'test'
        }
      }, function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, 'test');
        assert.equal(body.user_id, 1);
        done();
      });
    });

    it('login, wrong password', function(done) {
      req({
        body: {
          username: 'test',
          password: 'asdf'
        }
      }, function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 401);
        assert(body.message);
        done();
      });
    });

    it('login, http authentication', function(done) {
      req({
        auth: {
          user: 'test',
          pass: 'test',
          sendImmediately: true
        }
      }, function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 400);
        assert(body.message);
        done();
      });
    });
  });

  describe('/api/account', function() {

    // case specific request

    function req(path, extra, cb) {
      extra.url = base.url + path;
      request(opts(base, extra), cb);
    }

    it('login -> account', function(done) {
      var jar = request.jar();
      req('/api/login', {
        method: 'POST',
        jar: jar,
        body: {
          username: 'test',
          password: 'test'
        }
      }, function (err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, 'test');
        assert.equal(body.user_id, 1);
        req('/api/account', {
          method: 'GET',
          jar: jar
        }, handleAccount);
      });
      function handleAccount(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, 'test');
        assert.equal(body.user_id, 1);
        done();
      }
    });

    it('-> account', function(done) {
      req('/api/account', {
      }, function (err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 401);
        assert(body.message);
        done();
      });
    });
  });

  describe('/api/logout', function() {

    // case specific request

    function req(path, extra, cb) {
      extra.url = base.url + path;
      request(opts(base, extra), cb);
    }

    it('login -> logout -> account', function(done) {
      var jar = request.jar();
      req('/api/login', {
        method: 'POST',
        jar: jar,
        body: {
          username: 'test',
          password: 'test'
        }
      }, function (err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, 'test');
        assert.equal(body.user_id, 1);
        req('/api/logout', {
          method: 'GET',
          jar: jar
        }, handleLogout);
      });
      function handleLogout(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert(body.message);
        req('/api/account', {
          method: 'GET',
          jar: jar
        }, handleAccount);
      }
      function handleAccount(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 401);
        assert(body.message);
        done();
      }
    });
  });

  describe('/api/signup, DELETE /api/account', function() {

    // case specific data

    // this username must not exist in the database
    var username = 'wert';
    var password = 'sdfg';

    // case specific request

    function req(path, extra, cb) {
      extra.url = base.url + path;
      request(opts(base, extra), cb);
    }

    // the following test cases are dependant on each other

    // in the first task we register a new user whose user_id
    // is not known beforehand.
    // if any of these tasks fail, the database is probably messed
    // up and has to be initialized anew.

    it('signup -> account -> logout', function(done) {
      var jar = request.jar();
      req('/api/signup', {
        method: 'POST',
        jar: jar,
        body: {
          username: username,
          password: password
        }
      }, function (err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, username);
        req('/api/account', {
          method: 'GET',
          jar: jar
        }, step2);
      });
      function step2(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, username);
        req('/api/logout', {
          method: 'GET',
          jar: jar
        }, step3);
      }
      function step3(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert(body.message);
        done();
      }
    });

    it('login -> delete -> account', function(done) {
      var jar = request.jar();
      req('/api/login', {
        method: 'POST',
        jar: jar,
        body: {
          username: username,
          password: password
        }
      }, function (err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, username);
        req('/api/account', {
          method: 'DELETE',
          jar: jar
        }, step2);
      });
      function step2(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        assert.equal(body.username, username);
        req('/api/account', {
          method: 'GET',
          jar: jar
        }, step3);
      }
      function step3(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 401);
        assert(body.message);
        done();
      }
    });
  });
});
