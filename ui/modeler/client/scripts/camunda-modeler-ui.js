/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. Camunda licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/* jshint browserify: true */
var $ = window.jQuery = window.$ = require('jquery');
require('camunda-commons-ui/vendor/bootstrap');

var commons = require('camunda-commons-ui/lib');
var sdk = require('camunda-commons-ui/vendor/camunda-bpm-sdk-angular');
var dataDepend = require('angular-data-depend');
var camCommon = require('../../../common/scripts/module');
var lodash = require('camunda-commons-ui/vendor/lodash');

var APP_NAME = 'cam.modeler';

var angular = require('camunda-commons-ui/vendor/angular');
var pagesModule = require('./pages/main');
var directivesModule = require('./directives/main');
var servicesModule = require('./services/main');
//var pluginsModule = require('./plugins/main');

module.exports = function(pluginDependencies) {

  var ngDependencies = [
    'ng',
    'ngResource',
    'pascalprecht.translate',
    'dataDepend',
    commons.name,
    pagesModule.name,
    directivesModule.name,
    servicesModule.name
    //pluginsModule.name
  ].concat(pluginDependencies.map(function(el) {
    return el.ngModuleName;
  }));

  var appNgModule = angular.module(APP_NAME, ngDependencies);

  function getUri(id) {
    var uri = $('base').attr(id);
    if (!id) {
      throw new Error('Uri base for ' + id + ' could not be resolved');
    }

    return uri;
  }

  var ModuleConfig = [
    '$routeProvider',
    'UriProvider',
    function(
      $routeProvider,
      UriProvider
    ) {
      $routeProvider.otherwise({ redirectTo: '/modeler' });

      UriProvider.replace(':appName', 'modeler');
      UriProvider.replace('app://', getUri('href'));
      UriProvider.replace('adminbase://', getUri('app-root') + '/app/admin/');
      UriProvider.replace('modeler://', getUri('modeler-api'));
      UriProvider.replace('admin://', getUri('admin-api') + '../admin/');
      UriProvider.replace('plugin://', getUri('modeler-api') + 'plugin/');
      UriProvider.replace('engine://', getUri('engine-api'));

      UriProvider.replace(':engine', [ '$window', function($window) {
        var uri = $window.location.href;

        var match = uri.match(/\/app\/modeler\/([\w-]+)(|\/)/);
        if (match) {
          return match[1];
        } else {
          throw new Error('no process engine selected');
        }
      }]);
    }];

  appNgModule.provider('configuration', require('./../../../common/scripts/services/cam-configuration')(window.camModelerConf, 'Modeler'));
  appNgModule.controller('ModelerPage', require('./controllers/modeler-page'));

  appNgModule.config(ModuleConfig);

  require('./../../../common/scripts/services/locales')(appNgModule, getUri('app-root'), 'modeler');

  angular.bootstrap(document.documentElement, [ appNgModule.name, 'cam.modeler.custom' ]);

  if (top !== window) {
    window.parent.postMessage({ type: 'loadamd' }, '*');
  }
};

module.exports.exposePackages = function(container) {
  container.angular = angular;
  container.jquery = $;
  container['camunda-commons-ui'] = commons;
  container['camunda-bpm-sdk-js'] = sdk;
  container['angular-data-depend'] = dataDepend;
  container['cam-common'] = camCommon;
  container['lodash'] = lodash;
};


/* live-reload
// loads livereload client library (without breaking other scripts execution)
$('body').append('<script src="//' + location.hostname + ':LIVERELOAD_PORT/livereload.js?snipver=1"></script>');
/* */
