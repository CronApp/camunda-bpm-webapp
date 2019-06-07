'use strict';

var angular = require('angular');

module.exports = [
  '$scope', '$modalInstance', '$location', '$translate', 'upload', 'getDeploymentUrl', 'processDefinition', 'Notifications', 'Uri',
  function($scope, $modalInstance, $location, $translate, upload, getDeploymentUrl, processDefinition, Notifications, Uri) {

    var PERFORM_DEPLOY = 'performDeployment',
        DEPLOY_SUCCESS = 'deploymentSuccess',
        DEPLOY_FAILED = 'deploymentFailed';

    $scope.status = 'beforeDeployment';

    var deployment = $scope.deployment = {
      deploymentName: null
    };

    $scope.$on('$routeChangeStart', function() {
      $modalInstance.close($scope.status);
    });

    var isValid = $scope.isValid = function() {
      var formScope = angular.element('[name="deployForm"]').scope();
      return (formScope && formScope.deployForm) ? formScope.deployForm.$valid : false;
    };

    function getFilename(deploymentName) {
      return deploymentName.indexOf('.bpmn') === -1 ? deploymentName + '.bpmn' : deploymentName;
    }

    var deploymentResult;

    $scope.deploy = function() {
      if (!isValid()) {
        return;
      }

      $scope.status = PERFORM_DEPLOY;

      var fields = {
        'deployment-name': deployment.deploymentName,
        'deployment-source': 'cockpit'
      };

      var files = [{
        file: {
          name: getFilename(deployment.deploymentName)
        },
        content: processDefinition.bpmn20Xml
      }];

      upload(Uri.appUri('engine://engine/:engine/deployment/create'), files, fields).then(function(deployment) {
        $scope.status = DEPLOY_SUCCESS;
        deploymentResult = deployment;
        Notifications.addMessage({
          'status': $translate.instant('PLGN_DPLY_DEPLOYMENT_SUCCESSFUL'),
          'message': $translate.instant('PLGN_DPLY_RESOURCE_UPDATED')
        });
      }).catch(function(err) {
        $scope.status = DEPLOY_FAILED;
        var message = JSON.parse(err.target.responseText).message;
        Notifications.addError({
          'status': $translate.instant('PLGN_DPLY_DEPLOYMENT_FAILED'),
          'message': $translate.instant('PLGN_DPLY_RESOURCE_NOT_UPDATED') + message,
          'exclusive': ['type']
        });
      });
    };

    $scope.close = function(status) {
      $modalInstance.close(status);

      if (status === DEPLOY_SUCCESS && deploymentResult) {
        var search = {
          deployment: deploymentResult.id,
          deploymentsQuery: JSON.stringify([{
            type     : 'id',
            operator : 'eq',
            value    : deploymentResult.id
          }])
        };

        $location.path('repository');
        $location.search(search);
        $location.replace();
      }
    };
  }];
