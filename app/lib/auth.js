var crypto = require('crypto');
var auth = require('basic-auth');
var buffertools = require('buffertools');
var db = require('./db');

// requires session middleware to be present

module.exports = function(req, res, next) {
  console.log('no user');
  if (!req.session.user) {
    var user = auth(req);
    console.log('auth');
    if (user) {
      console.log('got params')
      authenticate(user, req, res, next);
      return;
    }
  }
  next();
}

function authenticate(user, req, res, next) {
  console.log('querying');
  db.query(
      'select username, role, user_id, pass, salt from userdata where username = $1;',
      [user.name], function(err, result) {
    if (err) {
      console.error('failed to load userdata');
      res.json(500, { message: 'server error' });
    } else if (result.rowCount > 0) {
      console.log('got result');
      var userdata = result.rows[0];
      crypto.pbkdf2(user.pass, userdata.salt, 10000, 32, function(err, pass) {
        if (err) {
          console.error('failed to calculate hash');
          res.json(500, { message: 'server error' });
        } else {
          console.log('got result', pass.toString('hex'), userdata.pass.toString('hex'));
          if (buffertools.equals(pass, userdata.pass)) {
            // save session
            req.session.user = {
              username: userdata.username,
              role: userdata.role,
              user_id: userdata.user_id
            };
          } else {
            // user and pass do not match
          }
          next();
        }
      });
    } else {
      console.log(user.name, 'not found!');
      // user not found
      next();
    }
  });
}
