'use strict';

var $ = window.jQuery = window.$ = require('jquery');

module.exports = [
  '$scope',
  '$location',
  '$translate',
  '$modalInstance',
  '$timeout',
  'upload',
  'processDefinition',
  'Notifications',
  'Uri',
  function(
    $scope,
    $location,
    $translate,
    $modalInstance,
    $timeout,
    upload,
    processDefinition,
    Notifications,
    Uri
  ) {
    var executeAfterDestroy = [];

    $scope.$on('$destroy', function() {
      var job;
      while((job = executeAfterDestroy.pop())) {
        if (typeof job === 'function') {
          $timeout(job);
        }
      }
    });

    $scope.$on('$routeChangeStart', function() {
      $scope.$dismiss();
    });

    var successNotification = function() {
      Notifications.addMessage({
        status: $translate.instant('PLGN_SAVE_PROCESS_SUCCESS'),
        message: $translate.instant('PLGN_SAVE_PROC_DEF_SUCCESS'),
        scope: $scope
      });
    };

    var errorNotification = function(message) {
      Notifications.addError({
        status: $translate.instant('PLGN_SAVE_PROCESS_FAILED'),
        message: $translate.instant('PLGN_SAVE_PROC_DEF_FAILED') + ' ' + message,
        exclusive: true,
        scope: $scope
      });
    };

    $scope.save = function() {
      $scope.status = 'LOADING';

      var $xml = $(processDefinition.bpmn20Xml);
      var $process = $xml.find('process');

      var deploymentName = $process.attr('name') || $process.attr('id');

      var fields = {
        'deployment-name': deploymentName,
        'deployment-source': 'cockpit'
      };

      var files = [{
        file: {
          name: deploymentName + '.bpmn'
        },
        content: processDefinition.bpmn20Xml
      }];

      upload(Uri.appUri('engine://engine/:engine/cron-process-definition/save'), files, fields).then(function(deployment) {
        $location.path('/process-definition/' + deployment.deployedProcessDefinition.id + '/edit');
        $location.replace();

        executeAfterDestroy.push(function() {
          successNotification();
        });

        $modalInstance.close(deployment);
      }).catch(function(err) {
        $scope.status = null;
        var message = JSON.parse(err.target.responseText).message;
        errorNotification(message);
      });
    };
  }];
