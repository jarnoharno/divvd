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
var close = require('../lib/close');
var dada = require('../lib/dada');

var dao = module.exports = {};

var orm = shitorm({
  props: [
    'currency_id',
    'transaction_id',
    'person_id'
  ],
  pk: 'participant_id',
  table: 'participant',
  constructor: Participant
});

dao.create = orm.create;
dao.update = orm.update;
dao.delete = orm.delete;
dao.find = orm.find;

dao.find_by_transaction_id = dada.array(function(participant_id, db) {
  return db.query(
      'select * from participant_view where transaction_id = $1 ' +
      'order by participant_id;',
      [participant_id]);
}, Participant);

dao.owners = dada.array(function(participant_id, db) {
  return db.query(
      'select user_id from participant ' +
      'join transaction using (transaction_id)' +
      'join owner using (ledger_id) where participant_id = $1;',
      [participant_id]);
});
