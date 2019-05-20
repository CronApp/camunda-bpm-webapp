'use strict';

var angular = require('angular');

module.exports = [
  '$scope', '$modalInstance',
  function($scope,  $modalInstance) {

    var deployment = $scope.deployment = {
      deploymentName: null
    };

    $scope.$on('$routeChangeStart', function() {
      $modalInstance.close();
    });

    $scope.close = function() {
      $modalInstance.close();
    };

    var isValid = $scope.isValid = function() {
      var formScope = angular.element('[name="deployForm"]').scope();
      return (formScope && formScope.deployForm) ? formScope.deployForm.$valid : false;
    };

    $scope.deploy = function() {
      if (!isValid()) {
        return;
      }
      console.log('deploy ' + JSON.stringify(deployment));
      $modalInstance.close();
    };
  }];
