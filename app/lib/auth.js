var crypto = require('crypto');
var auth = require('basic-auth');
var buffertools = require('buffertools');
var db = require('./db');

// requires session middleware to be present

exports.signup = function(user, req, res) {
  if (!(user && user.name && user.pass)) {
    res.json(400, { message: 'expected name and pass' });
    return;
  }
  if (user.name.length < 2 || user.name.length > 80) {
    res.json(400, { message: 'name length must be between 2 and 80' });
    return;
  }
  if (user.pass.length < 4) {
    res.json(400, { message: 'pass must be at least 4 characters long' });
    return;
  }
  var salt = crypto.randomBytes(8);
  crypto.pbkdf2(user.pass, salt, 10000, 32, function(err, pass) {
    if (err) {
      console.error('failed to calculate hash');
      res.json(500, { message: 'server error' });
    } else {
      db.query('insert into "user" (username, role, hash, salt) values ($1, \'user\', $2, $3) returning user_id;',
          [user.name, pass, salt], function(err, result) {
        if (err) {
          if (err.code == 23505) {
            // postgresql unique_violation
            res.json(400, { message: 'name already exists' });
          } else {
            // unidentified error
            res.json(500, { message: 'server error' });
          }
        } else {
          // save session
          req.session.user = {
            username: user.name,
            role: 'user',
            user_id: result.rows[0].user_id
          };
          res.json(req.session.user);
        }
      });
    }
  });
};

exports.basicHttp = function(req, res, next) {
  if (!req.session.user) {
    var user = auth(req);
    if (user) {
      exports.auth(user, req, res, function() {
        // ignore error argument
        next();
      });
      return;
    }
  }
  next();
};

// on fatal error callback is not called but error response is sent
// on success user is saved to session
exports.auth = function(user, req, res, callback) {
  if (!(user && user.name && user.pass)) {
    res.json(400, { message: 'expected name and pass' });
    return;
  }
  if (!callback) {
    callback = function() {};
  }
  db.query(
      'select username, role, user_id, hash, salt from "user" where username = $1;',
      [user.name], function(err, result) {
    if (err) {
      console.error('failed to load userdata');
      res.json(500, { message: 'server error' });
    } else if (result.rowCount > 0) {
      var userdata = result.rows[0];
      crypto.pbkdf2(user.pass, userdata.salt, 10000, 32, function(err, pass) {
        if (err) {
          console.error('failed to calculate hash');
          res.json(500, { message: 'server error' });
        } else {
          if (buffertools.equals(pass, userdata.hash)) {
            // save session
            req.session.user = {
              username: userdata.username,
              role: userdata.role,
              user_id: userdata.user_id
            };
            callback();
          } else {
            // user and pass do not match
            callback('user and password do not match');
          }
        }
      });
    } else {
      // user not found
      callback('user not found');
    }
  });
};
