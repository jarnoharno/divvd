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

  dao.create_with_defaults = function(defs) {

    // buid dependencies
    var tables = {};
    Object.keys(defs).forEach(function(k) {
      if (defs[k].table) {
        tables[defs[k].table.name] = {};
        if (defs[k].table.where) {
          tables[defs[k].table.name].where = defs[k].table.where;
        }
        if (defs[k].table.depends) {
          tables[defs[k].table.name].depends = defs[k].table.depends.name
          tables[defs[k].table.name].key = defs[k].table.depends.key
        }
      }
    });

    return function(props, db) {

      var i = 0;
      var select_cols = [];
      var args = [];
      var join_tables = {};
      var where = {};
      var input_cols = [];
      var ph_map = {};

      // go through all predetermined cols
      obj.props.forEach(function(p) {
        if (props[p] !== undefined) {
          // value is explicitly given
          input_cols.push(p);
          select_cols.push('$' + (++i));
          ph_map[p] = i;
          args.push(props[p]);
        } else if (defs[p] !== undefined) {
          // default value should be used if it exists
          input_cols.push(p);
          if (defs[p].value !== undefined) {
            select_cols.push('$' + (++i));
            args.push(defs[p].value);
          } else if (defs[p].table !== undefined) {
            // default from other table
            function parnt(name) {
              if (tables[name].depends) {
                parnt(tables[name].depends);
              }
              if (join_tables[name]) return;
              join_tables[name] = {};
              if (tables[name].where) {
                join_tables[name].where = tables[name].where;
              }
              if (tables[name].depends) {
                join_tables[name].using = tables[name].key;
              }
            }
            select_cols.push('"' + defs[p].table.name + '".' +
                (defs[p].table.col || p));
            parnt(defs[p].table.name);
          } else {
            throw new Error('error parsing default values');
          }
        } else {
          // database will provide a default
        }
      });

      // construct query string
      var jtbl = ''
      var w = [];

      if (Object.keys(join_tables).length > 0) {
        jtbl = ' from';
      }
      var i = 0;
      Object.keys(join_tables).forEach(function(k) {
        if (i++ > 0) {
          if (!join_tables[k].using) {
            jtbl += ' cross';
          }
          jtbl += ' join';
        }
        jtbl += ' "' + k + '"';
        if (join_tables[k].using) {
          jtbl += ' using (' + join_tables[k].using + ')';
        }
        if (join_tables[k].where) {
          w.push(join_tables[k].where + ' = $' + ph_map[join_tables[k].where]);
        }
      });

      var ws = w.join(' and ');
      if (ws.length > 0) {
        ws = ' where ' + ws;
      }

      var query = 'insert into ' + obj.table + ' (' +
          input_cols.join(', ') + ') select ' +
          select_cols.join(', ') + jtbl + ws +
          ' returning *;';

      return db.query(query, args).
      error(util.pg_error).
      then(construct);
    };
  };

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
        col + ' = $1 order by ' + obj.pk + ';';
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
