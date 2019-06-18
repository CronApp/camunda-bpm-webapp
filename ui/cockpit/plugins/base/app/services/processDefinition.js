'use strict';

var $ = window.jQuery = window.$ = require('jquery');

var Service = ['$location', '$translate', 'upload', 'Notifications', 'Uri',
  function($location, $translate, upload, Notifications, Uri) {
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

        var deploymentName = $process.attr('name') || $process.attr('id');
        var versionTag = $process.attr('camunda:versiontag');

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
          content: processDefinition.bpmn20Xml
        }];

        var url = Uri.appUri('engine://engine/:engine/cron-process-definition/save');

        upload(url, files, fields).then(callback).catch(function(err) {
          $scope.status = null;
          Notifications.addError({
            status: $translate.instant('PLGN_SAVE_PROCESS_FAILED'),
            message: $translate.instant('PLGN_SAVE_PROC_DEF_FAILED') + ' ' + JSON.parse(err.target.responseText).message,
            exclusive: true,
            scope: $scope
          });
        });
      }
    };
  }];

module.exports = Service;
