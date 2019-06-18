'use strict';

var $ = window.jQuery = window.$ = require('jquery');

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

    $scope.visibilityCondition = function() {
      return $scope.status === DEPLOY_SUCCESS || $scope.status === DEPLOY_FAILED;
    };

    $scope.canDeploy = function() {
      return $scope.deployment.deploymentName;
    };

    function getFilename(deploymentName) {
      return deploymentName.indexOf('.bpmn') === -1 ? deploymentName + '.bpmn' : deploymentName;
    }

    var deploymentResult;

    $scope.deploy = function() {
      $scope.status = PERFORM_DEPLOY;

      var $xml = $(processDefinition.bpmn20Xml);
      var $process = $xml.find('process');

      var versionTag = $process.attr('camunda:versiontag');

      var fields = {
        'deployment-name': deployment.deploymentName,
        'version-tag': versionTag,
        'deployment-source': 'cockpit'
      };

      if (processDefinition.deploymentId) {
        fields['deployment-id'] = processDefinition.deploymentId;
      }

      var files = [{
        file: {
          name: getFilename(deployment.deploymentName)
        },
        content: processDefinition.bpmn20Xml
      }];

      upload(Uri.appUri('engine://engine/:engine/cron-process-definition/deploy'), files, fields).then(function(deployment) {
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
