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

    function updateVersionTagToRelease(bpmn20Xml) {
      return bpmn20Xml.replace('camunda:versionTag="snapshot"', 'camunda:versionTag="release"');
    }

    function findProcess($xml) {
      var selectors = ['process', 'bpmn\\:process', 'bpmn2\\:process'];

      for (var process, index = 0; index < selectors.length; index++) {
        process = $xml.find(selectors[index]);

        if (process.length) {
          break;
        }
      }

      return process;
    }

    function successNotification() {
      Notifications.addMessage({
        status: $translate.instant('PLGN_DPLY_DEPLOYMENT_SUCCESSFUL'),
        message: $translate.instant('PLGN_DPLY_RESOURCE_UPDATED')
      });
    }

    function errorNotification(message) {
      Notifications.addError({
        status: $translate.instant('PLGN_DPLY_DEPLOYMENT_FAILED'),
        message: $translate.instant('PLGN_DPLY_RESOURCE_NOT_UPDATED') + ' ' + message,
        exclusive: true
      });
    }

    var deploymentResult;

    $scope.deploy = function() {
      $scope.status = PERFORM_DEPLOY;

      var $xml = $(processDefinition.bpmn20Xml);
      var $process = findProcess($xml);

      var isExecutable = $process.attr('isExecutable');

      if (!isExecutable || isExecutable === 'false') {
        $scope.status = DEPLOY_FAILED;
        errorNotification($translate.instant('PLGN_DPLY_MODAL_EXECUTABLE_REQUIRED'));
        return false;
      }

      var versionTag = $process.attr('camunda:versionTag');

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
        content: updateVersionTagToRelease(processDefinition.bpmn20Xml)
      }];

      var url = Uri.appUri('engine://engine/:engine/cron-process-definition/deploy');

      upload(url, files, fields).then(function(deployment) {
        $scope.status = DEPLOY_SUCCESS;
        deploymentResult = deployment;
        successNotification();
      }).catch(function(err) {
        $scope.status = DEPLOY_FAILED;
        var message = JSON.parse(err.target.responseText).message;
        errorNotification(message);
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
