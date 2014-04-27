var Promise = require('bluebird');
var Hox = require('./hox');

var session = module.exports = {};

session.delete_current = function(req) {
  var usr = req.session.user;
  delete req.session.user;
  return usr;
};

session.delete = function(req, user_id) {
  // delete session data and respond
  // this depends on sessionStore providing 'all' method, which is
  // the case with the default express session memory store
  return Promise.promisify(req.sessionStore.all.bind(req.sessionStore))().
  then(function(sessions) {
    sessions.forEach(function(session) {
      if (session.user && session.user.user_id == user_id) {
        delete session.user;
      }
    });
    if (req.session.user && req.session.user.user_id === user_id) {
      delete req.session.user;
    }
  });
};

session.current_user = function(req) {
  if (req.session.user) {
    return Promise.resolve(req.session.user);
  } else {
    return Promise.reject(new Hox(401, 'unauthenticated'));
  }
};

session.auth = function(req, pattern) {
  return function(owners) {
    if (owners === undefined) {
      owners = [];
    } else if (typeof owners === 'number') {
      owners = {
        user_id: owners
      };
    }
    if (!(owners instanceof Array)) {
      owners = [owners];
    }
    return session.current_user(req).
    bind(owners).
    then(function(usr) {
      if (usr.role.match(pattern) ||
          this.reduce(function(prev, owner) {
            return prev || owner.user_id === usr.user_id;
          }, false)) {
        return usr;
      }
      throw new Hox(404, 'not found');
    });
  };
};

session.unspoof = function() {
  if (err instanceof Hox) {
    throw new Hox(401, 'unauthorized');
  }
  throw err;
};

session.authorize = function(req, authf, spoof) {
  return session.current_user(req).
  then(function(usr) {
    if (authf(usr)) {
      return usr;
    } else if (spoof) {
      // this should be identical to actual not found error
      throw new Hox(404, 'not found');
    } else {
      throw new Hox(401, 'unauthorized');
    }
  });
};

// authorizes if authf returns true
// instead of sending 401, sends 404 to prevent leaking
// user existence

session.authorize_spoof = function(req, authf) {
  return session.authorize(req, authf, true);
};
