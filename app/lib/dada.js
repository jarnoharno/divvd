var qdb = require('./qdb');

var reg = /\(([^)]+)\)/;

function inspect_params(f) {
  var parms = reg.exec(f);
  if (parms)
    return parms[1].split(',');
  return [];
}

function ret_array(f) {
  var n = inspect_params(f).length;
  return function() {
    var args = Array.prototype.slice.call(arguments);
    args[n-1] = args[n-1] || qdb;
    return f.apply(undefined, args).
    then(function(result) {
      return result.rows;
    });
  }
}

function ret_single(f) {
  return ret_array(f).
  then(function(rows) {
    return rows[0];
  });
}

module.exports = function(mod) {
  return {
    array: ret_array,
    single: ret_single
  };
};
