// extremely stupid database debugging for node repl
// example:
// > var r = {}
// > var db = require('./db')()
// > db('select 1', r)
// > r.o

var pg = require('pg');

module.exports = function(url) {
  if (!url) {
    url = 'postgres://divvd:divvd@localhost/divvd';
  }
  return function(query, obj) {
    client = new pg.Client(url);
    client.connect(function(err) {
      if (err) {
        obj.o = err;
      } else {
        client.query(query, function(err, res) {
          if (err) {
            obj.o = err;
          } else {
            obj.o = res;
          }
          client.end();
        });
      }
    });
  };
};
