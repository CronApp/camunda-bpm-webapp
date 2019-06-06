'use strict';

module.exports = [
  '$scope',
  '$modalInstance',
  'upload',
  'Uri',
  'Notifications',
  'getDeploymentUrl',
  '$translate',
  function(
    $scope,
    $modalInstance,
    upload,
    Uri,
    Notifications,
    getDeploymentUrl,
    $translate
  ) {
    $scope.onFileInputChange = function(files) {
      $scope.files = $scope.files || [];
      $scope.files = $scope.files.concat(files);
    };

    $scope.removeFile = function(file) {
      $scope.files.splice($scope.files.indexOf(file), 1);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss();
    };

    $scope.canDeploy = function() {
      return $scope.files && $scope.files.length > 0 && $scope.deploymentName;
    };

    $scope.deploy = function() {
      var deployment = {
        'deployment-name': $scope.deploymentName,
        'deployment-source': 'cockpit'
      };

      upload(Uri.appUri('engine://engine/:engine/deployment/create'), this.files, deployment).then(function(deployment) {
        Notifications.addMessage({
          status: $translate.instant('PLGN_DPLY_DEPLOYMENT_SUCCESSFUL'),
          message: $translate.instant('PLGN_DPLY_RESOURCE_UPDATED') + '<a href="' + getDeploymentUrl(deployment) + '">' + $translate.instant('PLGN_DPLY_SEE_DEPLOYMENT') + '</a>',
          unsafe: true
        });

        $modalInstance.close();
      }).catch(function(err) {
        var message = JSON.parse(err.target.responseText).message;

        Notifications.addError({
          status: $translate.instant('PLGN_DPLY_DEPLOYMENT_FAILED'),
          message: $translate.instant('PLGN_DPLY_RESOURCE_NOT_UPDATED') + message,
          exclusive: true
        });
      });
    };
  }];
