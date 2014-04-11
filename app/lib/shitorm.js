var Hox = require('./hox');
var qdb = require('./qdb');
var util = require('../dao/util');

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

  function construct_all(result) {
    return result.rows.map(function(row) {
      return new obj.constructor(row);
    });
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

  function values(obj) {
    return Object.keys(obj).map(function(k) {
      return obj[k];
    });
  }

  function placeholder_string(length) {
    if (length == 0) {
      return '';
    }
    var ret = '$1';
    for (var i = 1; i < length; ++i) {
      ret += ', $' + (i + 1);
    }
    return ret;
  }

  dao.create = function(props, db) {
    db = db || qdb;

    var keys = Object.keys(props);
    var vals = keys.map(function(k) { return props[k]; });
    var keys_string = keys.join(', ');
    var ph_string = placeholder_string(keys.length);

    var query =
        'insert into "' + obj.table + '" (' + keys_string + ') values (' +
        ph_string + ') returning ' + obj.all_string + ';';

    return db.query(query, vals).
    error(util.pg_error).
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

  dao.all = function(db) {
    db = db || qdb;
    var query = 'select ' + obj.all_string + ' from "' + obj.table + '";';
    return db.query(query).
    then(construct_all);
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

  dao.find_by = function(col, val, db) {
    db = db || qdb;
    var query =
        'select ' + obj.all_string + ' from "' + obj.table + '" where ' +
        col + ' = $1;';
    return db.query(query, [val]).
    then(construct_all);
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
