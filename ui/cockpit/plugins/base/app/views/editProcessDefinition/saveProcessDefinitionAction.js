'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/save-process-definition-action.html', 'utf8');
var dialogTemplate = fs.readFileSync(__dirname + '/save-process-definition-dialog.html', 'utf8');

var Controller = ['$scope', '$modal', '$rootScope', function($scope, $modal, $rootScope) {
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
    }).result.then(function() {
      $rootScope.$broadcast('cam-common:cam-searchable:query-force-change');
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
