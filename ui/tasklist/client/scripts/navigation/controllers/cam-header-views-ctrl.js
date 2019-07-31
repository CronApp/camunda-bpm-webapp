  'use strict';
  module.exports = [
    '$scope',
    'Views',
    'AuthenticationService',
    'TokenService',
    function($scope, Views, AuthenticationService, TokenService) {
      TokenService.refreshToken();

      AuthenticationService.logout = function() {
        window.location.href = window.location.origin + '/#/home';
      };

      $scope.navbarVars = { read: [ 'tasklistApp' ] };
      $scope.navbarActions = Views.getProviders({ component: 'tasklist.navbar.action' });
    }];
