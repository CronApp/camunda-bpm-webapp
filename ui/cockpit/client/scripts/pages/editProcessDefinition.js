'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/edit-process-definition.html', 'utf8');

var angular = require('camunda-commons-ui/vendor/angular');
var camCommons = require('camunda-commons-ui/lib');

var ngModule = angular.module('cam.cockpit.pages.editProcessDefinition', ['dataDepend', camCommons.name]);

var Controller = [
  '$location', '$scope', '$rootScope', 'search', 'ProcessDefinitionResource', 'Views', 'Data', 'Transform', 'dataDepend', 'processDefinition', 'page', '$translate',
  function($location, $scope, $rootScope, search, ProcessDefinitionResource, Views, Data, Transform, dataDepend, processDefinition, page, $translate) {
    if (!processDefinition.suspended) {
      $location.path('/process-definition/' + processDefinition.id + '/runtime');
      $location.search(search() || {});
      $location.replace();
    } else {
      var processData = $scope.processData = dataDepend.create($scope);

      processData.provide('processDefinition', processDefinition);

      processData.provide('filter', function() { return { parentProcessDefinitionId: search().parentProcessDefinitionId }; });

      processData.provide('parentId', [ 'filter', function(filter) { return filter.parentProcessDefinitionId; } ]);

      processData.provide('parent', [ 'parentId', function(parentId) {
        if (!parentId) {
          return null;
        } else {
          return ProcessDefinitionResource.get({ id : parentId }).$promise;
        }
      }]);

      $rootScope.showBreadcrumbs = true;

      $scope.breadcrumbData = processData.observe([ 'processDefinition', 'parent' ], function(definition, parent) {
        page.breadcrumbsClear();

        page.breadcrumbsAdd({
          label: $translate.instant('PROCESS_DEFINITION_PROCESSES'),
          href: '#/processes/'
        });

        if (parent) {
          page.breadcrumbsAdd({
            type: 'processDefinition',
            label: parent.name || (parent.id.slice(0, 8) +'…'),
            href: '#/process-definition/'+ parent.id +'/runtime',
            processDefinition: parent
          });
        }

        page.breadcrumbsAdd({
          type: 'processDefinition',
          label: definition.name || definition.key || definition.id,
          href: '#/process-definition/'+ definition.id +'/runtime',
          processDefinition: definition
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

      $scope.processDefinition = processDefinition;

      $scope.showDeployButton = false;

      $scope.editProcessDefinitionVars = { read: [ 'processDefinition', 'processData', 'showDeployButton' ] };
      $scope.editProcessDefinitionActions = Views.getProviders({ component: 'cockpit.processDefinition.modeler.action' });
    }
  }];

var RouteConfig = [ '$routeProvider', function($routeProvider) {
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
    label: 'Edit'
  });
}];

ngModule
  .config(RouteConfig)
  .config(ViewConfig);

module.exports = ngModule;
