'use strict';

var angular = require('angular');

module.exports = [
  '$scope',
  /*'$translate',
  'Notifications',
  'camAPI',*/
  function(
    $scope/*,
    $translate,
    Notifications,
    camAPI*/
  ) {

    var NEW_PROCESS_DEFINITION = {
      name: null
    };

    // var ProcessDefinition = camAPI.resource('task'); // TODO get processDefinition resource

    /*var processDefinition = */
    $scope.processDefinition = angular.copy(NEW_PROCESS_DEFINITION);

    var _form = null;

    $scope.setNewProcessDefinitionForm = function(innerForm) {
      _form = innerForm;
    };

    $scope.$on('$locationChangeSuccess', function() {
      $scope.$dismiss();
    });

    var isValid = $scope.isValid = function() {
      return _form && _form.$valid;
    };

    $scope.save = function() {
      if (!isValid()) {
        return;
      }

      $scope.$close();

      /*ProcessDefinition.create(processDefinition, function(err) {
        if (err) {
          $translate('PROCESS_DEFINITION_SAVE_ERROR').then(function(translated) {
            Notifications.addError({
              status: translated,
              message: (err ? err.message : ''),
              exclusive: true,
              scope: $scope
            });
          });
        }
        else {
          $scope.$close();
        }
      });*/
    };

  }];
