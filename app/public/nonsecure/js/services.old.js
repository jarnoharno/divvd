'use strict';

/* Services */

angular.module('divvd.services', []).
  // provides route name and parameters after successful change
  factory('route', ['$route', '$rootScope', '$routeParams',
      function($route, $rootScope, $routeParams) {
    var prop = Object.create({
      beginsWith: function(str) {
        return this.route.substring(0, str.length) === str;
      }
    });
    prop.route = '/';
    function setRouteInfo() {
      if ($route.current && $route.current.controllerAs) {
        prop.route = $route.current.controllerAs;
      } else {
        console.error('controllerAs not defined!');
        prop.route = '/';
      }
      prop.params = $routeParams;
      $rootScope.$emit('routeInfoChanged', prop);
    }
    $rootScope.$on('$routeChangeSuccess', setRouteInfo);
    setRouteInfo();
    return {
      prop: prop
    };
  }]).
  factory('auth', ['$http', '$rootScope', function($http, $rootScope) {

    // default guest user
    var guest = {
      username: 'guest',
      role: 'guest',
      user_id: 0
    };

    // observable properties

    var prop = {
      user: {},
      loginStatusChecked: false
    };
    setUser(guest);

    // exposed functions
    //
    // return promise so clients can react on success/failure

    function login(user) {
      return $http.post('/api/login', user).
      success(setUser);
    }
    function account() {
      var promise = $http.get('/api/account');
      promise['finally'](setLoginStatusChecked);
      return promise.success(setUser);
    }
    function logout() {
      return $http.get('/api/logout').
      success(setUser.bind(undefined, guest));
    }
    function signup(user) {
      return $http.post('/api/signup', user).
      success(setUser);
    }

    // private functions

    function setUser(user) {
      angular.extend(prop.user, user);
      return prop.user;
    }
    function setLoginStatusChecked() {
      prop.loginStatusChecked = true;
      $rootScope.digest();
    }

    // try to fetch account the first time the module is loaded
    account();

    return {
      prop: prop,
      login: login,
      account: account,
      logout: logout,
      signup: signup
    };
  }]).
  factory('appState', function() {
    return {
      data : {
        ledgers: []
      }
    };
  }).
  factory('routeHandler', ['$rootScope', 'auth', '$location', 'appState',
          'ledger', '$q',
      function($rootScope, auth, $location, appState, ledger, $q) {
    $rootScope.$on('routeInfoChanged', function(event, routeInfo) {
      if (routeInfo.route === '/logout') {
        auth.logout().then(function() {
          $location.path('/');
        });
      }
      if (routeInfo.route === '/ledgers') {
        // construct ledgers for view
        ledger.all().$promise.
        then(function(ls) {
          return $q.all(ls.map(function(l) {
            // monkey patch currency map
            l.currency_map = {};
            return ledger.currencies({ledger_id: l.ledger_id}).$promise.
            then(function(cs) {
              l.currencies = cs;
              cs.forEach(function(c) {
                l.currency_map[c.currency_id] = c;
              });
              l.total_currency = l.currency_map[l.total_currency_id];
              return l;
            });
          }));
        }).
        then(function(ls) {
          // change app state
          appState.data.ledgers = ls;
        });
      }
      if (routeInfo.beginsWith('/ledgers/:ledgerId')) {
        // TODO
      }
    });
  }]);
