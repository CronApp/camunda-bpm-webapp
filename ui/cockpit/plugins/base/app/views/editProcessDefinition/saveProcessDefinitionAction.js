'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/save-process-definition-action.html', 'utf8');
var dialogTemplate = fs.readFileSync(__dirname + '/save-process-definition-dialog.html', 'utf8');

var Controller = [
  '$scope',
  '$modal',
  '$rootScope',
  'PluginProcessDefinitionService',
  function(
    $scope,
    $modal,
    $rootScope,
    PluginProcessDefinitionService
  ) {
    $scope.openSaveDialog = function() {
      $modal.open({
        controller: 'SaveProcessDefinitionController',
        template: dialogTemplate,
        windowClass: 'save-process-definition-modal',
        resolve: {
          processDefinition: function() {
            return $scope.processDefinition;
          }
        }
      });
    };

    $scope.saveEdition = function() {
      PluginProcessDefinitionService.save($scope.processDefinition, $scope, function(deployment) {
        PluginProcessDefinitionService.successNotification($scope);
        PluginProcessDefinitionService.redirectToEdit(deployment.deployedProcessDefinition.id);
      });
    };
  }];

module.exports = ['ViewsProvider', function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.modeler.action', {
    id: 'save-process-definition-action',
    template: actionTemplate,
    controller: Controller,
    priority: 50
  });
}];
