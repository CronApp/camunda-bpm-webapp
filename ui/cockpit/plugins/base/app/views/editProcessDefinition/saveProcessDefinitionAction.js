'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/save-process-definition-action.html', 'utf8');

var Controller = ['$scope', function($scope) {
  $scope.save = function() {
    alert($scope.processDefinition.bpmn20Xml);
  };
}];

module.exports = ['ViewsProvider', function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.modeler.action', {
    id: 'save-process-definition-action',
    label: 'PLUGIN_UPDATE_SUSPENSION_STATE',
    template: actionTemplate,
    controller: Controller,
    priority: 50
  });
}];
