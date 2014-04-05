var Hox = require('../lib/hox');

var util = module.exports = {};

util.first_row = function(result) {
  return result.rows[0];
};

util.pg_error = function(err) {
  switch (parseInt(err.cause.code)) {
    case 23503: // foreign key violation
      throw new Hox(400, err.cause.detail);
    case 23505: // unique violation
      throw new Hox(400,
        err.cause.detail.match(/^Key \(([^)]*)\)/)[1] + ' already exists');
    default:
      throw err;
  }
};

util.check_empty = function(result) {
  if (result.rowCount == 0) {
    throw new Hox(404, 'not found');
  }
  return result;
};

util.single_row_query = function(query) {
  return function() {
    return query.apply(null, arguments).
    then(util.first_row);
  }
};

util.construct = function(constructor) {
  return function(result) {
    return new constructor(util.first_row(result));
  }
};

util.construct_set = function(constructor) {
  return function(result) {
    return result.rows.map(function(row) {
      return new constructor(row);
    });
  }
};
