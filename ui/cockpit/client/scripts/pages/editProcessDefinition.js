'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/edit-process-definition.html', 'utf8');

var angular = require('camunda-commons-ui/vendor/angular');
var routeUtil = require('../../../../common/scripts/util/routeUtil');
var camCommons = require('camunda-commons-ui/lib');

var ngModule = angular.module('cam.cockpit.pages.editProcessDefinition', ['dataDepend', camCommons.name]);

var Controller = [
  '$location', '$scope', '$rootScope', 'ProcessDefinitionResource', 'Views', 'Data', 'Transform', 'dataDepend', 'processDefinition', 'page', '$translate',
  function($location, $scope,   $rootScope,   ProcessDefinitionResource,   Views,   Data,   Transform,   dataDepend,   processDefinition,   page, $translate
  ) {
    var processData = $scope.processData = dataDepend.create($scope);
    var pageData = $scope.pageData = dataDepend.create($scope);

    $scope.diagramCollapsed = true;
    $scope.onDiagramCollapseChange = function(collapsed) {
      if (!$scope.$$phase) {
        $scope.$apply(function() {
          $scope.diagramCollapsed = collapsed;
        });
      } else {
        $scope.diagramCollapsed = collapsed;
      }
    };

    // utilities ///////////////////////
    $scope.hovered = null;
    $scope.hoverTitle = function(id) {
      $scope.hovered = id || null;
    };
    // end utilities ///////////////////////

    // begin data definition //////////////////////
    processData.provide('processDefinition', processDefinition);

    processData.provide('bpmn20Xml', [ 'processDefinition', function(definition) {
      return ProcessDefinitionResource.getBpmn20Xml({ id : definition.id}).$promise;
    }]);

    processData.provide('parsedBpmn20', [ 'bpmn20Xml', function(bpmn20Xml) {
      return Transform.transformBpmn20Xml(bpmn20Xml.bpmn20Xml);
    }]);

    processData.provide('bpmnElements', [ 'parsedBpmn20', function(parsedBpmn20) {
      return parsedBpmn20.bpmnElements;
    }]);

    processData.provide('bpmnDefinition', [ 'parsedBpmn20', function(parsedBpmn20) {
      return parsedBpmn20.definitions;
    }]);

    processData.provide('allProcessDefinitions', [ 'processDefinition', function(definition) {
      var queryParams = {
        'key' : definition.key,
        'sortBy': 'version',
        'sortOrder': 'desc' };

      if(definition.tenantId) {
        queryParams.tenantIdIn = [ definition.tenantId ];
      } else {
        queryParams.withoutTenantId = true;
      }

      return ProcessDefinitionResource.query(queryParams).$promise;
    }]);

    // processDiagram /////////////////////
    processData.provide('processDiagram', [ 'bpmnDefinition', 'bpmnElements', function(bpmnDefinition, bpmnElements) {
      var diagram = $scope.processDiagram = $scope.processDiagram || {};

      angular.extend(diagram, {
        bpmnDefinition: bpmnDefinition,
        bpmnElements: bpmnElements
      });

      return diagram;
    }]);
    // end data definition /////////////////////////

    // begin data usage ////////////////////////////
    $rootScope.showBreadcrumbs = true;

    processData.observe('allProcessDefinitions', function(allDefinitions) {
      $scope.allDefinitions = allDefinitions;
    });

    $scope.breadcrumbData = processData.observe([ 'processDefinition' ], function(definition) {
      page.breadcrumbsClear();

      page.breadcrumbsAdd({
        label: $translate.instant('PROCESS_DEFINITION_PROCESSES'),
        href: '#/processes/'
      });

      var plugins = Views.getProviders({ component: 'cockpit.editProcessDefinition.view' });

      page.breadcrumbsAdd({
        type: 'processDefinition',
        label: definition.name || definition.key || definition.id,
        href: '#/process-definition/'+ definition.id +'/edit',
        processDefinition: definition,

        choices: plugins.sort(function(a, b) {
          return a.priority < b.priority ? -1 : (a.priority > b.priority ? 1 : 0);
        }).map(function(plugin) {
          return {
            active: plugin.id === 'edit',
            label: plugin.label,
            href: '#/process-definition/' + definition.id + '/' + plugin.id
          };
        })
      });

      page.titleSet((definition.name || definition.key || definition.id).toString());
    });

    $scope.processDiagramData = processData.observe('processDiagram', function(processDiagram) {
      $scope.processDiagram = processDiagram;
    });

    $scope.processDefinition = processDefinition;

    $scope.processDefinitionVars = { read: [ 'processDefinition', 'selection', 'processData', 'pageData', 'allDefinitions' ] };
    //$scope.processDefinitionActions = Views.getProviders({ component: 'cockpit.processDefinition.runtime.action' });

    // extend the current scope to instantiate
    // with process definition data providers
    Data.instantiateProviders('cockpit.processDefinition.data', { $scope: $scope, processData : processData });

    // INITIALIZE PLUGINS
    var processPlugins = (
      //Views.getProviders({ component: 'cockpit.processDefinition.runtime.action' })).concat(
      Views.getProviders({ component: 'cockpit.editProcessDefinition.view' })).concat(
      Views.getProviders({ component: 'cockpit.processDefinition.diagram.overlay' })).concat(
      Views.getProviders({ component: 'cockpit.jobDefinition.action' }));

    var initData = {
      processDefinition : processDefinition,
      processData       : processData,
      pageData          : pageData
    };

    for(var i = 0; i < processPlugins.length; i++) {
      if(typeof processPlugins[i].initialize === 'function') {
        processPlugins[i].initialize(initData);
      }
    }

    $scope.isLatestVersion = function() {
      return $scope.processDefinition && $scope.processDefinition.version === getLatestVersion();
    };

    function getLatestVersion()  {
      if ($scope.allDefinitions) {
        return Math.max.apply(null, $scope.allDefinitions.map(function(def) {
          return def.version;
        }));
      }
    }

    $scope.getMigrationUrl = function() {
      var path = '#/migration';

      var latestVersion = getLatestVersion();

      var searches = {
        sourceKey: $scope.processDefinition.key,
        targetKey: $scope.processDefinition.key,
        sourceVersion: $scope.isLatestVersion() ? $scope.processDefinition.version - 1 : $scope.processDefinition.version,
        targetVersion: $scope.isLatestVersion() ? $scope.processDefinition.version : latestVersion
      };

      return routeUtil.redirectTo(path, searches, [ 'sourceKey', 'targetKey', 'sourceVersion', 'targetVersion' ]);
    };
  }];

var RouteConfig = [
  '$routeProvider',
  function(
    $routeProvider
  ) {

    $routeProvider
      .when('/process-definition/:id/edit', {
        template: template,

        controller: Controller,
        authentication: 'required',
        resolve: {
          processDefinition: [ 'ResourceResolver', 'ProcessDefinitionResource',
            function(ResourceResolver, ProcessDefinitionResource) {
              return ResourceResolver.getByRouteParam('id', {
                name: 'process definition',
                resolve: function(id) {
                  return ProcessDefinitionResource.get({ id : id });
                }
              });
            }]
        },
        reloadOnSearch: false
      });
  }];

var ViewConfig = [ 'ViewsProvider', function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.editProcessDefinition.view', {
    id: 'edit',
    priority: 20,
    label: 'Edit',
    keepSearchParams: []
  });
}];

ngModule
  .config(RouteConfig)
  .config(ViewConfig);

module.exports = ngModule;
