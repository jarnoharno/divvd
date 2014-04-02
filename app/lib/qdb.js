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
  return db.client(function(client) {
    var query = Promise.promisify(client.query.bind(client));
    if (data) {
      return query(queryString, data);
    }
    return query(queryString);
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
  var clientDone = function() {};
  return Promise.promisify(pg.connect.bind(pg))(url).
  spread(function(client, done) {
    // this ain't pretty
    clientDone = done;
    return client;
  }).
  then(procedure).
  finally(clientDone);
};
