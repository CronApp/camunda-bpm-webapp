'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/deploy-process-definition-action.html', 'utf8');
var dialogTemplate = fs.readFileSync(__dirname + '/deploy-process-definition-dialog.html', 'utf8');

var Controller = ['$scope', '$modal', function($scope, $modal) {
  $scope.openDialog = function() {
    $modal.open({
      resolve: {
        processData: function() { return $scope.processData; },
        processDefinition: function() { return $scope.processDefinition; }
      },
      size: 'lg',
      controller: 'DeployProcessDefinitionController',
      template: dialogTemplate
    });
  };
}];

module.exports = ['ViewsProvider', function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.modeler.action', {
    id: 'deploy-process-definition-action',
    label: 'PLUGIN_UPDATE_SUSPENSION_STATE',
    template: actionTemplate,
    controller: Controller,
    priority: 30
  });
}];
