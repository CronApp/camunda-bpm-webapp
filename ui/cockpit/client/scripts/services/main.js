'use strict';

var angular = require('camunda-commons-ui/vendor/angular'),

    transform = require('./transform'),
    variables = require('./variables'),
    breadcrumbTrails = require('./breadcrumbTrails'),
    routeUtil = require('./../../../../common/scripts/services/routeUtil'),
    page = require('./../../../../common/scripts/services/page'),
    camAPI = require('./../../../../common/scripts/services/cam-api'),
    hasPlugin = require('./../../../../common/scripts/services/has-plugin'),
    localConf = require('camunda-commons-ui/lib/services/cam-local-configuration'),
    typeUtils = require('./../../../../common/scripts/services/typeUtils'),
    tokenService = require('./../../../../common/scripts/services/tokenService');

var servicesModule = angular.module('cam.cockpit.services', []);

servicesModule.factory('Transform', transform);
servicesModule.factory('Variables', variables);
servicesModule.service('page', page);
servicesModule.factory('breadcrumbTrails', breadcrumbTrails);
servicesModule.factory('routeUtil', routeUtil);
servicesModule.factory('camAPI', camAPI);
servicesModule.factory('hasPlugin', hasPlugin);
servicesModule.factory('localConf', localConf);
servicesModule.factory('typeUtils', typeUtils);
servicesModule.service('TokenService', tokenService);

module.exports = servicesModule;
