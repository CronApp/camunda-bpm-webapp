'use strict';

var angular = require('angular'),
    createProcessDefinitionPlugin = require('./action/cam-cockpit-navbar-action-create-process-definition-plugin'),
    createProcessDefinitionModal = require('./action/modals/cam-cockpit-create-process-definition-modal');

var ngModule = angular.module('cockpit.plugin.processDefinition.navbar.action', []);

ngModule.config(createProcessDefinitionPlugin);

ngModule.controller('camCreateProcessDefinitionModalCtrl', createProcessDefinitionModal);

module.exports = ngModule;
