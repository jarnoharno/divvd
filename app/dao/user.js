var User        = require('../models/user');
var crypt       = require('../lib/qcrypt');
var Hox         = require('../lib/hox');
var util        = require('./util');
var shitorm     = require('../lib/shitorm');
var buffertools = require('buffertools');
var dada        = require('../lib/dada');
var qdb         = require('../lib/qdb');

var dao = module.exports = {};

var construct_user = util.construct(User);

dao.create = function(body, db) {
  return crypt(body.password).
  then(function(res) {
    return db.query(
        'insert into "user" (username, hash, salt) values ($1, $2, $3) ' +
        'returning username, role, user_id;',
        [body.username, res.hash, res.salt]);
  }).
  error(util.pg_error).
  then(construct_user);
};

function not_found() {
  throw new Hox(401, 'username and password do not match');
}

dao.find_username_and_password = function(body, db) {
  db = db || qdb;
  return db.query(
      'select username, role, user_id, hash, salt from "user" ' +
      'where username = $1;',
      [body.username]).
  then(function(result) {
    if (!result.rowCount) {
      not_found();
    }
    var row = result.rows[0];
    return crypt(body.password, row.salt).
    then(function(res) {
      if (buffertools.equals(res.hash, row.hash)) {
        return new User(row);
      } else {
        not_found();
      }
    });
  });
};

dao.find_by_ledger_id = function(ledger_id, db) {
  return db.query(
      'select username, role, user_id, currency_id, total_credit_currency_id ' +
      'from "user" natural join owner where ledger_id = $1;',
      [ledger_id]).
  then(util.construct_set(User));
};

dao.find_username = function(username, db) {
  return db.query(
      'select username, role, user_id from "user" where username = $1 limit 1;',
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
dao.all = orm.all;
dao.find = orm.find;
