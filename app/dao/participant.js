var shitorm       = require('../lib/shitorm');
var Participant   = require('../models/participant');
var dada          = require('../lib/dada');

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

// transaction_id is a required parameter because where refers to it
dao.create = orm.create_with_defaults({
  currency_id: {
    table: {
      name: 'transaction',
      where: 'transaction_id'
    }
  },
  person_id: {
    table: {
      name: 'person',
      depends: {
        name: 'transaction',
        key: 'ledger_id'
      }
    }
  }
});

dao.update = orm.update;
dao.delete = orm.delete;
dao.find = orm.find;

dao.find_by_transaction_id = dada.array(function(transaction_id, db) {
  return db.query(
      'select * from participant_view where transaction_id = $1 ' +
      'order by participant_id;',
      [transaction_id]);
}, Participant);

dao.owners = dada.array(function(participant_id, db) {
  return db.query(
      'select user_id from participant ' +
      'join transaction using (transaction_id)' +
      'join owner using (ledger_id) where participant_id = $1;',
      [participant_id]);
});
