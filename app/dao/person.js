var shitorm = require('../lib/shitorm');
var Person = require('../models/person');
var dada = require('../lib/dada');

var dao = module.exports = {};

var orm = shitorm({
  props: [
    'name',
    'currency_id',
    'user_id',
    'ledger_id'
  ],
  pk: 'person_id',
  table: 'person',
  constructor: Person
});

dao.update = orm.update;
dao.delete = orm.delete;
dao.find = orm.find;

dao.find_by_ledger_id = orm.find_by.bind(undefined, 'ledger_id');

dao.owners = dada.array(function(person_id, db) {
  return db.query(
      'select owner.user_id from person ' +
      'join owner using (ledger_id) where person_id = $1;',
      [person_id]);
});

dao.create = orm.create_with_defaults({
  currency_id: {
    table: {
      name: 'ledger_settings',
      where: 'ledger_id',
      col: 'total_currency_id'
    }
  },
  name: {
    table: {
      name: 'user',
      where: 'user_id',
      col: 'username'
    }
  },
});
