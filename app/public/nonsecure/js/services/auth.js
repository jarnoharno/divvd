'use strict';

angular.module('divvd.services.auth', []).
factory('q', ['$q', function($q) {
  return {
    resolve: function(value) {
      var deferred = $q.defer();
      deferred.resolve(value);
      return deferred.promise;
    },
    reject: function(value) {
      return $q.reject(value);
    }
  };
}]).
factory('auth', ['$resource', 'q', '$state', function($resource, q, $state) {

  // data that can be watched
  var data = {
    loginChecked: false,
    user: null
  };

  var User = $resource('/api/account', {}, {
    account: {
      method: 'GET'
    },
    login: {
      method: 'POST',
      url: '/api/login'
    },
    logout: {
      method: 'GET',
      url: '/api/logout'
    },
    signup: {
      method: 'POST',
      url: '/api/signup'
    }
  });

  // check login status
  // never rejects, resolves with user or null
  function check() {
    return User.account().$promise.
    then(function(usr) {
      data.user = usr;
    }, function() {
      data.user = null;
    }).
    then(function() {
      data.loginChecked = true;
      return data.user;
    });
  }

  // resolves with logged in user or null
  function user() {
    if (data.loginChecked) {
      return q.resolve(data.user);
    }
    return check();
  }

  // rejects if user is logged in
  function checkGuest() {
    return user().
    then(function(user) {
      if (user) {
        throw new Error('user logged in');
      }
    });
  }

  function setUser(user) {
    user = user || null;
    data.user = user;
    data.loginChecked = true;
    return user;
  }

  function login(user) {
    return User.login(user).$promise.
    then(setUser);
  }

  function logout() {
    return User.logout().$promise.
    then(setUser.bind(undefined, null));
  }

  function signup(user) {
    return User.signup(user).$promise.
    then(setUser);
  }

  function redirect(mustBeGuest, state) {
    return user().then(function(usr) {
      if (!!usr == mustBeGuest) {
        $state.go(state);
      }
    });
  }

  return {
    data: data,
    user: user,
    checkGuest: function(state) {
      return redirect(true, state);
    },
    checkMember: function(state) {
      return redirect(false, state);
    },
    login: login,
    logout: logout,
    signup: signup
  };
}]);
