'use strict';

// var $ = window.jQuery = window.$ = require('jquery');
var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/save-process-definition-action.html', 'utf8');

var Controller = ['$scope', function($scope) {
  $scope.save = function() {
    // var $xml = $($scope.processDefinition.bpmn20Xml);
    // $xml.find('process').attr('isExecutable')
    // console.info($xml);

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
