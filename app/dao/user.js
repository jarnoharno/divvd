var User = require('../models/user');
var db = require('../lib/qdb');
var crypt = require('../lib/qcrypt');
var Hox = require('../lib/hox');

var dao = module.exports = {};

dao.create = function(username, password) {
  return crypt(password).
  then(function(crypt) {
    return db.query('insert into "user" (username, hash, salt) values ($1, $2, $3) returning role, user_id;',
        [username, crypt.hash, crypt.salt]);
  }).
  then(function(result) {
    var row = result.rows[0];
    return new User(username, row.role, row.user_id);
  }).
  error(function(err) {
    if (err.cause.code == 23505) {
      // postgresql unique_violation
      throw new Hox(400, 'username already exists');
    }
    // unidentified error
    throw err;
  });
};



