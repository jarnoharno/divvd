var User = require('../models/user');
var db = require('../lib/qdb');
var crypt = require('../lib/qcrypt');
var Hox = require('../lib/hox');
var qdb = require('../lib/qdb');
var util = require('./util');
var shitorm = require('../lib/shitorm');

var dao = module.exports = {};

var construct_user = util.construct(User);

dao.create = function(username, password, db) {
  db = db || qdb;
  return crypt(password).
  then(function(crypt) {
    return db.query('insert into "user" (username, hash, salt) values ($1, $2, $3) returning username, role, user_id;',
        [username, crypt.hash, crypt.salt]);
  }).
  then(construct_user);
};

dao.find_by_ledger_id = function(ledger_id, db) {
  db = db || qdb;
  return db.query('select username, role, user_id from "user" natural join owner where ledger_id = $1;',
      [ledger_id]).
  then(function(result) {
    return result.rows.map(function(row) {
      return new User(row);
    });
  });
};

dao.find_username = function(username) {
  return db.query('select username, role, user_id from "user" where username = $1 limit 1;',
      [username]).
  then(construct_user);
};

// automatically generated stuff

var orm = shitorm({
  props: [
    'username',
    'role'
  ],
  pk: 'user_id',
  table: 'user',
  constructor: User
});

dao.delete = orm.delete;
dao.update = orm.update;
dao.find = orm.find;
