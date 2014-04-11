var pg = require('pg');
var array = require('./array');
var Promise = require('bluebird');

var db = module.exports = {};

// private database url
var url = 'postgres://divvd:divvd@localhost/divvd';

db.escapeSql = function(str) {
  return str.toString().replace("'","''");
}

db.init = function(dburl) {
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
//
// returns result as promise

db.query = function(queryString, data) {
  return db.client(function(query) {
    if (data) {
      return query(queryString, data);
    }
    return query(queryString);
  });
};

// run transaction
//
// begin statement will be issued if connection is succesfully formed.
// if user procedure resolves, commit will be issued automatically.
// rollback will be issued on failure.
//
// return procedure's return value as promise

db.transaction = function(procedure) {
  return db.client(function(query) {

    // mock db object with query/transaction-interface
    var db = {
      query: query,
      transaction: function(cb) {
        return cb(db);
      }
    };

    return query('begin;').
    then(function() {
      return Promise.try(procedure.bind(null, db)).
      catch(function(err) {
        return query('rollback;').
        then(function() {
          throw err;
        });
      }).
      then(function(result) {
        return query('commit;').
        then(function() {
          return result;
        });
      });
    });
  });
};

// get client from pool
// resource will be closed automatically when returned resource is
// resolved or rejected
//
// return procedure's return value as promise

db.client = function(procedure) {
  if (!url) {
    return Promise.reject('database unitialized');
  }
  var client_done = function() {};
  return Promise.promisify(pg.connect.bind(pg))(url).
  spread(function(client, done) {
    // this ain't pretty
    client_done = done;
    return Promise.promisify(client.query.bind(client));
  }).
  then(procedure).
  finally(function() {
    client_done();
  });
};
