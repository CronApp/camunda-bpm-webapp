'use strict';

module.exports = [
  '$scope', '$modalInstance', 'Notifications', 'processDefinition', 'processDefinitions', 'processInstances', '$location', 'camAPI', 'configuration', '$translate',
  function($scope, $modalInstance, Notifications, processDefinition, processDefinitions, processInstances, $location, camAPI, configuration, $translate) {
    var PERFORM = 'PERFORM',
        SUCCESS = 'SUCCESS',
        FAILED = 'FAILED',
        skipCustomListeners = configuration.getSkipCustomListeners();

    $scope.processDefinition = processDefinition;
    $scope.instancesCount = processInstances.count;

    var options = $scope.options = {
      cascade: false,
      skipCustomListeners: skipCustomListeners['default']
    };

    $scope.hideSkipCustomListeners = skipCustomListeners.hidden;

    $scope.$on('$routeChangeStart', function() {
      $modalInstance.close();
    });

    $scope.redirectToProcessDefinition = function() {
      $scope.latestProcessDefinitionId ? $location.path('/process-definition/' + $scope.latestProcessDefinitionId + '/runtime') : $location.path('/processes');
    };

    $scope.deleteProcessDefinition = function() {
      $scope.status = PERFORM;

      var deleteParams = {
        id: processDefinition.id,
        skipCustomListeners: options.skipCustomListeners,
        cascade: options.cascade
      };

      var processDefinitionResource = camAPI.resource('process-definition');

      processDefinitionResource.delete(deleteParams).then(function() {
        $scope.status = SUCCESS;

        for (var b, i = 0; i < processDefinitions.length; i++) {
          if (processDefinitions[i].id === processDefinition.id) {
            b = i;
            break;
          }
        }

        processDefinitions.splice(b, 1);

        if (processDefinitions.length > 0) {
          $scope.latestProcessDefinitionId = processDefinitions[0].id;
        }

        Notifications.addMessage({
          status: $translate.instant('PLGN_PDEF_NOTIFICATION_FINISHED'),
          message: $translate.instant('PLGN_PDEF_NOTIFICATION_MSG_FINISHED', {
            id: processDefinition.id
          }),
          exclusive: true
        });
      }).catch(function(err) {
        $scope.status = FAILED;

        Notifications.addError({
          status: $translate.instant('PLGN_PDEF_NOTIFICATION_ERROR'),
          message: err,
          exclusive: true
        });
      });
    };
  }];
