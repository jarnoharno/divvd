var common = require('./common');
var colors = require('colors');
var array = require('../lib/array');
var session = require('../lib/session');
var ledger = require('../dao/ledger');

// GET /api/ledgers
//
// Return all ledgers owned by current user
//
// \return [{
//  title:string
//  total_currency_id:integer
//  ledger_id:integer
// }]
exports.ledgers = function(req, res) {
  session.current_user(req).
  then(function(usr) {
    return ledger.find_by_user_id(usr.user_id);
  }).
  then(function(ledgers) {
    res.json(ledgers);
  }).
  catch(common.handle(res));
};

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

exports.ledger = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/debug|admin/) ||
            req.params.ledger.owners.reduce(function(prev, owner) {
              return prev || owner.user_id === me.user_id;
            }, false);
  }).
  then(function() {
    res.json(req.params.ledger);
  }).
  catch(common.handle(res));
};

// POST /api/ledgers
//
// Creates a new ledger. Admin can create new ledger
// for anyone, other roles only for themselves.
//
// \post_param title:string                   (default:"New ledger")
// \post_param total_currency: {
//   code:string
//   rate:number
// }
// \post_param user_id:                       (default: <current user>)
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
  
  if (!req.session.user) {
    return common.requireAuth(req, res);
  }

  // construct parameters
  var ledger = {
    title: 'New ledger',
    currency_id: 1,
    owners: [{ user_id: req.session.user.user_id }]
  };

  // these checks should probably be converted to jsonschema
  if (req.body) {
    if (req.body.title) {
      ledger.title = req.body.title;
    }
    if (req.body.currency_id) {
      ledger.currency_id = req.body.currency_id;
    }
    if (array.isArray(req.body.owners)) {
      array.appendTo(ledger.owners, req.body.owners);
    }
  }

  // filter duplicate owners
  ledger.owners = array.uniques(ledger.owners, function(user) {
    return user.user_id;
  });

  // these needs to be abstracted somehow

  function rollback(client, done) {
    client.query('rollback;', function(err) {
      done(err);
    });
  }

  db.client(function(err, client, done) {
    client.query('begin', function(err) {
      if (err) {
        rollback(client, done, __filename + ':create_ledger: failed to begin');
        res.json(500, { message: 'server error' });
        console.error(colors.cyan('failed to open connection'));
        return;
      }
      client.query('insert into ledger (title, currency_id) values ($1, $2) returning ledger_id;',
          [ledger.title, ledger.currency_id],
          function(err, result) {
        if (err) {
          rollback(client, done);
          if (err.code == 23503) {
            res.json(400, { message: 'cannot find currency_id '+
              ledger.currency_id });
          } else {
            console.error(colors.cyan('create_ledger: failed to insert ledger'));
            res.json(500, { message: 'server error' });
          }
          return;
        }

        // insert owners
        // we need to do this the old fashioned way since we can't
        // parameterize dynamic size queries
        //
        // user_id is already validated as integer and thus not escaped

        var ledgerId = result.rows[0].ledger_id;
        var query =
          'insert into owner (ledger_id, user_id) values ' +
          ledger.owners.map(
            function(x) {
              return '(' + ledgerId + ', ' + x.user_id + ')';
            }).
            join(', ') + ';';

        client.query(query, function(err) {
          if (err) {
            rollback(client, done);
            // foreign key constraint violation
            if (err.code == 23503) {
              var id = err.detail.match(/\(user_id\)=\((\d+)\)/)[1];
              res.json(400, { message: 'cannot find owner_id '+id });
            } else {
              console.error(colors.cyan(
                  'create_ledger: failed to insert owners'));
              res.json(500, { message: 'server error' });
            }
            return;
          }
          client.query('commit;', function(err) {
            if (err) {
              console.error('create_ledger: failed to commit');
              res.json(500, { message: 'server error' });
              return;
            }

            // success

            res.json(ledger);
          });
        });
      });
    });
  });
}

// Parses :ledgerId GET parameter
// we don't need the full ledger object each time but this is just easier

exports.param = {};
exports.param.ledger = function(req, res, next, id) {
  ledger.find(id).
  then(function(ledger) {
    req.params.ledger = ledger;
    next();
  }).
  catch(common.handle(res));
};
