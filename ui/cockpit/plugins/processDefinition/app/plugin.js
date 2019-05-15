'use strict';

var angular = require('angular');
var navbarModule = require('./navbar/main');

module.exports = angular.module('cockpit.plugin.processDefinition', [navbarModule.name]);
