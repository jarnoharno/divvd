var pg = require('pg');

var url = null;

exports.init = function(dburl) {
  if (!dburl) {
    console.error('undefined database url');
    process.exit(1);
  }
  pg.connect(dburl, function(err, client, done) {
    done(err);
    if (err) {
      console.error('error connecting database');
      process.exit(1);
    }
  });
  url = dburl;
};

// run single query
exports.query = function(query, data, callback) {
  exports.client(function(err, client, done) {
    if (err) {
      callback(err);
    } else {
      client.query(query, data, function(err, result) {
        //call `done()` to release the client back to the pool
        done(err);
        if (err) {
          console.error('error running query', err);
          callback(err);
        } else {
          callback(null, result);
        }
      });
    }
  });
};

// get client from pool
exports.client = function(callback) {
  if (!url) {
    var error = 'database unitialized';
    console.error(error);
    callback(error);
  } else {
    pg.connect(url, function(err, client, done) {
      if (err) {
        console.error('error fetching client from pool', err);
        callback(err);
      } else {
        callback(null, client, done)
      }
    });
  }
}
