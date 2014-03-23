'use strict';

/* Services */

angular.module('divvd.services', []).
  // provides route name and parameters after successful change
  factory('route', ['$route', '$rootScope', '$routeParams',
      function($route, $rootScope, $routeParams) {
    var prop = {};
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
  factory('routeHandler', ['$rootScope', 'auth', '$location',
      function($rootScope, auth, $location) {
    $rootScope.$on('routeInfoChanged', function(event, routeInfo) {
      if (routeInfo.route === '/logout') {
        auth.logout().then(function() {
          $location.path('/');
        });
      }
    });
  }]);
