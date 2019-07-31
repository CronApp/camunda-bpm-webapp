'use strict';

module.exports = ['$http', 'AuthenticationService',
  function($http, AuthenticationService) {

    function refreshToken() {
      var _u = JSON.parse(localStorage.getItem('_u'));

      if (_u && _u.token) {
        $http({
          method: 'GET',
          url: window.location.origin + '/auth/refresh'
        }).success(function (data) {
          localStorage.setItem("_u", JSON.stringify(data));

          setTimeout(function () { refreshToken(); }, (1800 * 1000));
        }).error(function () {
          localStorage.removeItem('_u');
          AuthenticationService.logout();
        });
      }
    }

    this.refreshToken = refreshToken;
  }];
