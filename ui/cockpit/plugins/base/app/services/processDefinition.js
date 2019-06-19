'use strict';

var $ = window.jQuery = window.$ = require('jquery');

var Service = ['$location', '$translate', 'upload', 'Notifications', 'Uri',
  function($location, $translate, upload, Notifications, Uri) {

    function errorNotification($scope, message) {
      Notifications.addError({
        status: $translate.instant('PLGN_SAVE_PROCESS_FAILED'),
        message: $translate.instant('PLGN_SAVE_PROC_DEF_FAILED') + ' ' + message,
        exclusive: true,
        scope: $scope
      });
    }

    function updateVersionTagToSnapshot(bpmn20Xml) {
      return bpmn20Xml.replace('camunda:versionTag="release"', 'camunda:versionTag="snapshot"');
    }

    return {
      redirectToEdit: function(processDefinitionId) {
        $location.path('/process-definition/' + processDefinitionId + '/edit');
      },
      successNotification : function($scope) {
        Notifications.addMessage({
          status: $translate.instant('PLGN_SAVE_PROCESS_SUCCESS'),
          message: $translate.instant('PLGN_SAVE_PROC_DEF_SUCCESS'),
          scope: $scope
        });
      },
      save : function(processDefinition, $scope, callback) {
        var $xml = $(processDefinition.bpmn20Xml);
        var $process = $xml.find('process');

        var isExecutable = $process.attr('isExecutable');

        if (!isExecutable || isExecutable === 'false') {
          $scope.status = null;
          errorNotification($scope, $translate.instant('PLGN_SAVE_PROC_DEF_EXECUTABLE_REQUIRED'));
          return false;
        }

        var deploymentName = $process.attr('name') || $process.attr('id');
        var versionTag = $process.attr('camunda:versionTag');

        var fields = {
          'deployment-name': deploymentName,
          'version-tag': versionTag,
          'deployment-source': 'cockpit'
        };

        if (processDefinition.deploymentId) {
          fields['deployment-id'] = processDefinition.deploymentId;
        }

        var files = [{
          file: {
            name: deploymentName + '.bpmn'
          },
          content: updateVersionTagToSnapshot(processDefinition.bpmn20Xml)
        }];

        var url = Uri.appUri('engine://engine/:engine/cron-process-definition/save');

        upload(url, files, fields).then(callback).catch(function(err) {
          $scope.status = null;
          errorNotification($scope, JSON.parse(err.target.responseText).message);
        });
      }
    };
  }];

module.exports = Service;
