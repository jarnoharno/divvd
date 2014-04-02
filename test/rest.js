var req = require('./req');
var request = require('request');
var rassert = require('./rassert');
var assert = require('assert');

// REST API test suite

describe('REST API', function() {

  describe('/api/login', function() {
    it('login', function(done) {
      req.login()().
      spread(rassert.user()).
      done(done);
    });

    it('login, wrong password', function(done) {
      req.login('test', 'asdf')().
      spread(rassert.unauthorized()).
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
      spread(rassert.bad_request()).
      then(req.login()).
      spread(rassert.user()).
      done(done);
    });
  });

  describe('/api/account', function() {

    it('login -> account', function(done) {
      var jar = request.jar();
      req.login(jar)().
      spread(rassert.user()).
      then(req.account(jar)).
      spread(rassert.user()).
      done(done);
    });

    it('-> account', function(done) {
      var jar = request.jar();
      req.account(jar)().
      spread(rassert.bad_request()).
      done(done);
    });
  });

  describe('/api/logout', function() {

    it('login -> logout -> account', function(done) {
      var jar = request.jar();
      req.login(jar)().
      spread(rassert.user()).
      then(req.logout(jar)).
      spread(rassert.user()).
      then(req.account(jar)).
      spread(rassert.bad_request()).
      done(done);
    });
  });

  describe('/api/signup, DELETE /api/account', function() {

    // case specific data

    // this username must not exist in the database
    var username = 'wert';
    var password = 'sdfg';


    // the following test cases are dependant on each other

    // in the first task we register a new user whose user_id
    // is not known beforehand.
    // if any of these tasks fail, the database is probably messed
    // up and has to be initialized anew.

    it('signup -> account -> logout -> account', function(done) {
      var jar = request.jar();
      req.signup(username, password, jar)().
      spread(rassert.user(username)).
      then(req.account(jar)).
      spread(rassert.user(username)).
      then(req.logout(jar)).
      spread(rassert.user(username)).
      then(req.account(jar)).
      spread(rassert.bad_request()).
      done(done);
    });

    it('login -> delete -> account', function(done) {
      var jar = request.jar();
      req.login(username, password, jar)().
      spread(rassert.user(username)).
      then(req.delete_account(jar)).
      spread(function(err, res, body) {
        assert(!body.user_id);
        return [err, res, body];
      }).
      spread(rassert.user(username)).
      then(req.account()).
      spread(rassert.bad_request()).
      done(done);
    });
  });
});
