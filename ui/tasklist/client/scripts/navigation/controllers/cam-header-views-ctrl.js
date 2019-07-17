  'use strict';
  module.exports = [
    '$scope',
    'Views',
    'AuthenticationService',
    function($scope, Views, AuthenticationService) {
      AuthenticationService.logout = function() {
        window.location.href = window.location.origin + '/#/home';
      };

      $scope.navbarVars = { read: [ 'tasklistApp' ] };
      $scope.navbarActions = Views.getProviders({ component: 'tasklist.navbar.action' });
    }];
