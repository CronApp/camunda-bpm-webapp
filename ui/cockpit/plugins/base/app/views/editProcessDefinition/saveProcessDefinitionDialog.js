'use strict';

module.exports = [
  '$scope',
  '$modalInstance',
  '$timeout',
  'processDefinition',
  'PluginProcessDefinitionService',
  function(
    $scope,
    $modalInstance,
    $timeout,
    processDefinition,
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

    $scope.$on('$routeChangeStart', function() {
      $scope.$dismiss();
    });

    $scope.save = function() {
      $scope.status = 'LOADING';

      PluginProcessDefinitionService.save(processDefinition, $scope, function(deployment) {
        if (deployment) {
          PluginProcessDefinitionService.redirectToEdit(deployment.deployedProcessDefinition.id);

          executeAfterDestroy.push(function() {
            PluginProcessDefinitionService.successNotification($scope);
          });

          $modalInstance.close(deployment);
        }
      });
    };
  }];
