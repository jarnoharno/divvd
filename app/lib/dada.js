var qdb = require('./qdb');

var reg = /\(([^)]+)\)/;

function inspect_params(f) {
  var parms = reg.exec(f);
  if (parms)
    return parms[1].split(',');
  return [];
}

function ret(f, single, con) {
  var n = inspect_params(f).length;
  return function() {
    var args = Array.prototype.slice.call(arguments);
    args[n-1] = args[n-1] || qdb;
    return f.apply(undefined, args).
    then(function(result) {
      if (single) {
        if (con) {
          return new con(result.rows[0]);
        }
        return result.rows[0];
      }
      if (con) {
        return result.rows.map(function(row) {
          return new con(row);
        });
      }
      return result.rows;
    });
  }
}

function ret_array(f, con) {
  return ret(f, false, con);
}

function ret_single(f, con) {
  return ret(f, true, con);
}

module.exports = {
  array: ret_array,
  single: ret_single
};
