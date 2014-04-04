var User = require('../models/user');
var db = require('../lib/qdb');
var crypt = require('../lib/qcrypt');
var Hox = require('../lib/hox');

var user = module.exports = {};

function construct_user(result) {
  if (result.rowCount == 0) {
    throw new Hox(400, 'user not found');
  }
  return new User(result.rows[0]);
}

function unique_violation(err) {
  if (err.cause.code == 23505) {
    // postgresql unique_violation
    throw new Hox(400, 'user already exists');
  }
  // unidentified error
  throw err;
}

// all methods return a User

user.create = function(username, password) {
  return crypt(password).
  then(function(crypt) {
    return db.query('insert into "user" (username, hash, salt) values ($1, $2, $3) returning username, role, user_id;',
        [username, crypt.hash, crypt.salt]);
  }).
  error(unique_violation).
  then(construct_user);
};

user.delete = function(user_id) {
  return db.query('delete from "user" where user_id = $1 returning username, role, user_id;',
      [user_id]).
  then(constructUser);
};

user.find = function(user_id, qdb) {
  return qdb.query('select username, role, user_id from "user" where user_id = $1 limit 1;',
      [user_id]).
  then(construct_user);
};

user.find_username = function(username) {
  return db.query('select username, role, user_id from "user" where username = $1 limit 1;',
      [username]).
  then(construct_user);
};

user.update = function(user_id, user) {
  var keys_filter = {
    username: true,
    role: true
  };

  var keys = Object.keys(user).filter(function(k) { return keys_filter[k]; });
  var values = keys.map(function(k) { return user[k]; });
  values.push(user_id);

  // only keys that match to one of the keys in keys_filter will be
  // concatenated in the query string

  var query =
    'update "user" set ' +
    keys.map(function(k, i) {
      return k + ' = $' + (i + 1);
    }).join(', ') +
    ' where user_id = $' + (keys.length + 1) +
    ' returning username, role, user_id;';

  return db.query(query, values).
  error(unique_violation).
  then(construct_user);
};

