'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/cam-cockpit-deployment-modal.html', 'utf8');

module.exports = [
  '$scope',
  '$modal',
  'isFileUploadSupported',
  function(
    $scope,
    $modal,
    isFileUploadSupported
  ) {
    $scope.isFileUploadSupported = isFileUploadSupported();

    $scope.open = function() {
      $modal.open({
        template: template,
        controller: 'camDeploymentModalCtrl',
        size: 'lg'
      }).result.then($scope.onDeployed);
    };
  }];
