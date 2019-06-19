'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/save-process-definition-action.html', 'utf8');
var dialogTemplate = fs.readFileSync(__dirname + '/save-process-definition-dialog.html', 'utf8');

var Controller = [
  '$scope',
  '$modal',
  '$timeout',
  '$rootScope',
  'PluginProcessDefinitionService',
  function(
    $scope,
    $modal,
    $timeout,
    $rootScope,
    PluginProcessDefinitionService
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
        if (deployment) {
          PluginProcessDefinitionService.redirectToEdit(deployment.deployedProcessDefinition.id);

          executeAfterDestroy.push(function() {
            PluginProcessDefinitionService.successNotification($scope);
          });
        }
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
