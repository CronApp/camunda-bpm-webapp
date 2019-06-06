'use strict';

var fs = require('fs');

var dialogTemplate = fs.readFileSync(__dirname + '/delete-process-definition-dialog.html', 'utf8');
var actionTemplate = fs.readFileSync(__dirname + '/delete-process-definition-action.html', 'utf8');

var Controller = ['$scope', '$modal', function($scope, $modal) {
  $scope.openDialog = function(processDefinition, processDefinitions, processInstances) {
    $modal.open({
      resolve: {
        processDefinition: function() {
          return processDefinition;
        },
        processDefinitions: function() {
          return processDefinitions;
        },
        processInstances: function() {
          return processInstances;
        }
      },
      controller: 'DeleteProcessDefinitionController',
      template: dialogTemplate,
      backdrop: 'static',
      keyboard: false
    });
  };
}];

module.exports = ['ViewsProvider', function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
    id: 'delete-process-definition',
    label: 'PLGN_PDEF_DELETE_ACTION',
    template: actionTemplate,
    controller: Controller,
    priority: 20
  });
}];
