var pg = require('pg');
var array = require('./array');

// private database url
var url = null;

exports.escapeSql = function(str) {
  return str.toString().replace("'","''");
}

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
      if (!array.isArray(data)) {
        callback = data;
        client.query(query, handler);
      } else {
        client.query(query, data, handler);
      }
      function handler(err, result) {
        //call `done()` to release the client back to the pool
        done(err);
        if (err) {
          console.error('error running query', err);
          callback(err);
        } else {
          callback(null, result);
        }
      }
    }
  });
};

// get client from pool
// done() will be called automatically when returned promise is
// resolved or rejected
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
