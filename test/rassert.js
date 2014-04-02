var assert = require('assert');

var assert_user = exports.user = function(username) {
  if (!username) {
    username = 'test';
  }
  return function(err, res, body) {
    assert.equal(err, null);
    assert.equal(res.statusCode, 200);
    assert.equal(body.username, username);
    assert.equal(body.role, 'user');
    assert(!body.password);
    assert(!body.hash);
    assert(!body.salt);
    if (username == 'test') {
      assert.equal(body.user_id, 1);
    }
  };
}

var assert_user_error = exports.user_error = function(code) {
  return function(err, res, body) {
    assert.equal(err, null);
    assert.equal(res.statusCode, code);
    assert(body.message);
  }
}

var assert_unauthorized = exports.unauthorized = function() {
  return assert_user_error(401);
}

var assert_bad_request = exports.bad_request = function() {
  return assert_user_error(400);
}
