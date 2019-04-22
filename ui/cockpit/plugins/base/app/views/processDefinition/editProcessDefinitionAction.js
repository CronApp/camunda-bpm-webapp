'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/edit-process-definition-action.html', 'utf8');

var Configuration = function PluginConfiguration(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
    id: 'edit-process-definition-action',
    template: actionTemplate,
    priority: 5
  });
};

Configuration.$inject = ['ViewsProvider'];

module.exports = Configuration;
