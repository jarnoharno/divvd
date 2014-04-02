var assert = require('./assert');
var req = require('./req');
var request = require('request');

// REST API test suite

describe('REST API', function() {

  describe('/api/login', function() {
    it('login', function(done) {
      req.login()().
      spread(assert.user()).
      done(done);
    });

    it('login, wrong password', function(done) {
      req.login('test', 'asdf')().
      spread(assert.unauthorized()).
      done(done);
    });

    it('login, http authentication', function(done) {
      req('/api/login', {
        method: 'POST',
        auth: {
          user: 'test',
          pass: 'test',
          sendImmediately: true
        }
      })().
      spread(assert.bad_request()).
      then(req.login()).
      spread(assert.user()).
      done(done);
    });
  });

  describe('/api/account', function() {

    it('login -> account', function(done) {
      var jar = request.jar();
      req.login(jar)().
      spread(assert.user()).
      then(req.account(jar)).
      spread(assert.user()).
      done(done);
    });

    it('-> account', function(done) {
      var jar = request.jar();
      req.account(jar)().
      spread(assert.bad_request()).
      done(done);
    });
  });

  describe('/api/logout', function() {

    it('login -> logout -> account', function(done) {
      var jar = request.jar();
      req.login(jar)().
      spread(assert.user()).
      then(req.logout(jar)).
      spread(assert.user()).
      then(req.account(jar)).
      spread(assert.bad_request()).
      done(done);
    });
  });
/*
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
        assert.equal(body.username, username);
        assert.equal(body.role, 'user');
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
        assert.equal(body.role, 'user');
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

  describe('/api/ledger', function() {

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
        assert.equal(body.username, username);
        assert.equal(body.role, 'user');
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
        assert.equal(body.role, 'user');
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
  */
});
