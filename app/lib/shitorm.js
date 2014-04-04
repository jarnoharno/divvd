var Hox = require('./hox');
var qdb = require('./qdb');

module.exports = orm;

function orm(obj) {
  var dao = {};

  obj.props_string = obj.props.join(', ');
  obj.all_string = obj.props_string + ', ' + obj.pk;
  obj.keys_filter = {};
  obj.props.forEach(function(v) { obj.keys_filter[v] = true; });

  function construct(result) {
    return new obj.constructor(result.rows[0]);
  }

  function check_empty(result) {
    if (result.rowCount == 0) {
      throw new Hox(400, obj.table + ' not found');
    }
    return result;
  }

  function unique_violation(err) {
    if (err.cause.code == 23505) {
      // postgresql unique_violation
      throw new Hox(400, obj.table + ' already exists');
    }
    // unidentified error
    throw err;
  }

  dao.create = function(props, db) {
    db = db || qdb;
    var query =
        'insert into "' + obj.table + '" (' + obj.props_string + ') values (' +
        obj.props.map(function(v, i) { return '$' + (i + 1); }).join(', ') +
        ') returning ' + obj.all_string + ';';
    return db.query(query, props).
    error(unique_violation).
    then(construct);
  };

  dao.delete = function(pk, db) {
    db = db || qdb;
    var query =
        'delete from "' + obj.table + '" where ' + obj.pk + ' = $1 returning ' +
        obj.all_string + ';'
    return db.query(query, [pk]).
    then(check_empty).
    then(construct);
  };

  dao.find = function(pk, db) {
    db = db || qdb;
    var query =
        'select ' + obj.all_string + ' from "' + obj.table + '" where ' +
        obj.pk + ' = $1 limit 1;';
    return db.query(query, [pk]).
    then(check_empty).
    then(construct);
  };

  dao.update = function(pk, props, db) {
    db = db || qdb;

    var keys = Object.keys(props).filter(function(k) {
      return obj.keys_filter[k];
    });
    var values = keys.map(function(k) {
      return props[k];
    });
    values.push(pk);

    // only keys that match to one of the keys in keys_filter will be
    // concatenated in the query string

    var query =
      'update "' + obj.table + '" set ' +
      keys.map(function(k, i) {
        return k + ' = $' + (i + 1);
      }).join(', ') +
      ' where ' + obj.pk + ' = $' + (keys.length + 1) +
      ' returning ' + obj.props_string + ';';

    return db.query(query, values).
    error(unique_violation).
    then(check_empty).
    then(construct);
  };

  return dao;
}
