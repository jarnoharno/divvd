var Ledger = require('../models/ledger');
var currency = require('./currency');
var user = require('./user');
var person = require('./person');
var Hox = require('../lib/hox');
var Promise = require('bluebird');
var merge = require('../lib/merge');
var shitorm = require('../lib/shitorm');
var util = require('./util');
var extend = require('../lib/extend');
var qdb = require('../lib/qdb');
var Participant = require('../models/participant');
var amount = require('./amount');

var dao = module.exports = {};

var orm = shitorm({
  props: [
    'currency_id',
    'transaction_id',
    'person_id',
  ],
  pk: 'participant_id',
  table: 'participant',
  constructor: Participant
});

dao.create = orm.create;
dao.update = orm.update;
dao.delete = orm.delete;

dao.find_by_transaction_id = function(transaction_id, db) {
  db = db || qdb;
  return db.query('select * from participant_view where transaction_id = $1 order by participant_id;',
      [transaction_id]).
  then(util.construct_set(Participant));
};
dao.find = function(participant_id, db) {
  db = db || qdb;
  return db.query('select * from participant_view where participant_id = $1;',
      [participant_id]).
  then(util.construct(Participant));
};

dao.find_with_owners = function(participant_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return Promise.bind({}).
    then(function() {
      return dao.find(participant_id, db);
    }).
    then(function(participant) {
      this.participant = participant;
      return db.query('select user_id from owner join transaction using (ledger_id) where transaction_id = $1;',
          [participant.transaction_id]);
    }).
    then(function(result) {
      console.log(result.rows);
      this.owners = result.rows.map(function(row) {
        return row.user_id;
      });
      return this;
    });
  });
};
