var crypto = require('crypto');
var db = require('../lib/db');
var common = require('./common');

// GET /api/ledgers/:ledgerId
//
// Returns the requested ledger
//
// \get_param  ledger requested ledgerId
// \return {
//  title:string
//  currency_id:integer
//  owners: [{
//    username:string
//    user_id:integer
//  }]
//  ledger_id:integer 
// }

// this could be optimized by returning 'not found' earlier
exports.ledger = function(req, res) {
  if (req.session.user) {
    // ledger data is already in request parameters, so we only need to figure
    // out if login user is authenticated to get the requested ledger data
    db.query('select username, user_id from ledger natural join owner natural join "user" where ledger_id = $1;',
        [req.params.ledger.ledger_id],
        function(err, result) {
      if (err) {
        console.error(__filename+':ledger: failed to load ledger owners');
        res.json(500, { message: 'server error' });
      } else {
        for (var i = 0; i < result.rowCount; ++i) {
          if (result.rows[i].user_id == req.session.user.user_id) {
            req.params.ledger.owners = result.rows;
            res.json(req.params.ledger.owners);
            return;
          }
        }
        // Ledger is not found or current user is unauthorized.
        // In either case return 'ledger not found'.
        res.json(404, { message: 'ledger not found' });
      }
    });
  } else {
    common.requireAuth(req, res);
  }
}

// GET /api/ledgers
//
// Returns all ledgers in the system.
//
// \return [{
//  title:string
//  currency_id:integer
//  ledger_id:integer 
// }]

exports.ledgers = function(req, res) {
  if (req.session.user && req.session.user.role === 'debug') {
    db.query('select title, currency_id, ledger_id from ledger;',
        [], function(err, result) {
      if (err) {
        console.error(__filename+':ledgers: failed to load ledgers');
        res.json(500, { message: 'server error' });
      } else {
        res.json(result.rows);
      }
    });
  } else {
    common.requireAuth(req, res);
  }
}

// POST /api/ledgers
//
// Creates a new ledger.
//
// \post_param title:string                   (default:"New ledger")
// \post_param currency_id:integer            (default:1)
// \post_param owners: [{ user_id:integer }]  (default:[<current user_id>])
//
// \return {
//  title:string
//  currency_id:integer
//  owners: [{
//    username:string
//    user_id:integer
//  }]
//  ledger_id:integer 
// }

// maybe defaults should be defined only at the database level?
exports.create_ledger = function(req, res) {
console.log('asdfqwer');
  if (req.session.user) {

    console.log('asdf');
    res.json({ message: "morjesta" });

    // construct parameters
    var ledger = {
      title: "New ledger",
      currency_id: 1,
      owners: [ req.session.user ]
    };
    if (req.body && req.body.title) {
      ledger.title = req.body.title;
    }
    if (req.body && req.body.currency_id) {
      ledger.title = req.body.title;
    }
    if (req.body && isArray(req.body.owners)) {
      ledger.owners.splice(ledger.owners.length, 0, req.body.owners);
    }

    console.log(ledger);

    // this needs to be wrapped somehow

    function rollback(client, done) {
      client.query('rollback', function(err) {
        done(err);
      });
    }
    db.client(function(err, client, done) {
      client.query('begin', function(err, result) {
        if (err) return rollback(client, done);
        client.query('insert into ledger (title, currency_id) values ($1, $2) returning ledger_id',
            [ledger.title, ledger.currency_id],
            function(err, result) {
          if (err) return rollback(client, done);
          
          // insert owners
          // we need to do this the old fashioned way since pg doesn't have
          // a proper way to parameterize dynamic size quories

          var ledgerId = escapeSql(ledger_id);
          var query = 
          'insert into owner(ledger_id, user_id) values ' +
          ledger.owners.
            map(function(x) { return x.user_id; }).
            filter(function(x, i, arr) { return arr.indexOf(x) == i; }).
            map(function(x) { 
              return "('" + ledgerId + "', '" + escapeSql(x) + "')"; 
            }).
            join(', ') + ';';

          console.log(query);

          //ledger.owners.forEach(function(user) {
          //  if (user.user_id) {
          //    query += "'" + escapeSql(uscer.user_id) + 
          //});
          done();
          
        });
      });
    });
    
    db.query('select username, user_id from ledger natural join owner natural join "user" where ledger_id = $1;',
        [req.params.ledger.ledger_id],
        function(err, result) {
      if (err) {
        console.error(__filename+':ledger: failed to load ledger owners');
        res.json(500, { message: 'server error' });
      } else {
        
        for (var i = 0; i < result.rowCount; ++i) {
          if (result.rows[i].user_id == req.session.user.user_id) {
            req.params.ledger.owners = result.rows;
            res.json(req.params.ledger.owners);
            return;
          }
        }
        // Ledger is not found or current user is unauthorized.
        // In either case return 'ledger not found'.
        res.json(404, { message: 'ledger not found' });
      }
    });
  } else {
    common.requireAuth(req, res);
  }
}
function isArray(value) {
  return toString.call(value) === '[object Array]';
}
function escapeSql(str) {
  return str.toString().replace("'","''");
}


exports.ledgers = function(req, res) {
  if (req.session.user && req.session.user.role === 'debug') {
    db.query('select title, currency_id, ledger_id from ledger;',
        [], function(err, result) {
      if (err) {
        console.error(__filename+':ledgers: failed to load ledgers');
        res.json(500, { message: 'server error' });
      } else {
        res.json(result.rows);
      }
    });
  } else {
    common.requireAuth(req, res);
  }
}

// Parses :ledgerId GET parameter

exports.param = {};
exports.param.ledger = function(req, res, next, id) {
console.log('asdf');
  db.query('select title, currency_id, ledger_id from ledger where ledger_id = $1;',
      [id], function(err, result) {
    if (err) {
      console.error(__filename+':param.ledger: failed to load ledger');
      res.json(500, { message: 'server error' });
    } else if (result.rowCount > 0) {
      req.params.ledger = result.rows[0];
    } else {
      // ledger not found
    }
    next();
  });
}




