'use strict';

var angular = require('angular');

module.exports = [
  '$scope',
  '$http',
  '$filter',
  'Uri',
  'Notifications',
  '$modalInstance',
  'processDefinition',
  '$location',
  '$translate',
  '$timeout',
  function(
    $scope,
    $http,
    $filter,
    Uri,
    Notifications,
    $modalInstance,
    processDefinition,
    $location,
    $translate,
    $timeout
  ) {

    var BEFORE_UPDATE = 'BEFORE_UPDATE',
        PERFORM_UPDATE = 'PERFORM_UDPATE',
        UPDATE_FAILED = 'FAIL';

    $scope.processDefinition = processDefinition;

    $scope.status = BEFORE_UPDATE;

    $scope.data = {
      includeInstances : true
    };

    $scope.$on('$routeChangeStart', function() {
      $modalInstance.close($scope.status);
    });

    $scope.proceedToEditPage = function() {
      $scope.status = PERFORM_UPDATE;

      var data = {
        suspended: true,
        includeProcessInstances: $scope.data.includeInstances,
        executionDate: null
      };

      $http.put(Uri.appUri('engine://engine/:engine/process-definition/' + processDefinition.id + '/suspended/'), data)
        .success(function() {
          $timeout(function() {
            $location.path('/process-definition/' + processDefinition.id + '/edit');
            $location.replace();
          });
        }).error(function(response) {
          $scope.status = UPDATE_FAILED;

          var errorMessage = $translate.instant('PLUGIN_EDIT_PROC_DEF_MESSAGE_3', { message: response.message });

          Notifications.addError({
            status: $translate.instant('PLUGIN_EDIT_PROC_DEF_STATUS_FINISHED'),
            message: errorMessage,
            exclusive: true
          });
        });
    };

    $scope.isValid = function() {
      var formScope = angular.element('[name="editProcessDefinitionForm"]').scope();
      return (formScope && formScope.editProcessDefinitionForm) ? formScope.editProcessDefinitionForm.$valid : false;
    };

    $scope.close = function(status) {
      var response = {
        status: status,
        suspended: true,
        executeImmediately: true,
        executionDate: null
      };

      $modalInstance.close(response);
    };
  }];
