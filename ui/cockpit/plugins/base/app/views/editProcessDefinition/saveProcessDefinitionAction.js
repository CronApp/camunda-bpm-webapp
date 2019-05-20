'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/save-process-definition-action.html', 'utf8');
// var angular = require('angular');

module.exports = ['ViewsProvider', function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.modeler.action', {
    id: 'save-process-definition-action',
    label: 'PLUGIN_UPDATE_SUSPENSION_STATE',
    template: actionTemplate,
    priority: 50
  });
}];
