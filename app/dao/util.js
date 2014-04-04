var util = module.exports = {};

util.first_row = function(result) {
  return result.rows[0];
}

util.pg_error = function(err) {
  switch (parseInt(err.cause.code)) {
    case 23503: // foreign key violation
      throw new Hox(400, err.cause.detail);
    case 23505: // unique violation
      throw new Hox(400, err.cause.detail);
    default:
      throw err;
  }
}

util.single_row_query = function(query) {
  return function() {
    return query.apply(null, arguments).
    then(first_row);
  }
}
