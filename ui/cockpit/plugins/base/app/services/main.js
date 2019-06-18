'use strict';

var angular = require('camunda-commons-ui/vendor/angular'),

    processDefinition = require('./processDefinition');

var servicesModule = angular.module('cockpit.plugin.base.services', []);

servicesModule.factory('PluginProcessDefinitionService', processDefinition);

module.exports = servicesModule;
