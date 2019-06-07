'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/edit-process-definition-action.html', 'utf8');
var dialogTemplate = fs.readFileSync(__dirname + '/edit-process-definition-dialog.html', 'utf8');

var Controller = [
  '$scope', '$rootScope', '$modal',
  function($scope, $rootScope, $modal) {

    $scope.openDialog = function() {
      $modal.open({
        resolve: {
          processDefinition: function() { return $scope.processDefinition; }
        },
        controller: 'EditProcessDefinitionController',
        template: dialogTemplate
      });
    };
  }];

var Configuration = function PluginConfiguration(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
    id: 'edit-process-definition-action',
    template: actionTemplate,
    controller: Controller,
    priority: 5
  });
};

Configuration.$inject = ['ViewsProvider'];

module.exports = Configuration;
