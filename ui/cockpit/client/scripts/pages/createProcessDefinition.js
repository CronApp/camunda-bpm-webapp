'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/create-process-definition.html', 'utf8');

var angular = require('camunda-commons-ui/vendor/angular');
var camCommons = require('camunda-commons-ui/lib');

var ngModule = angular.module('cam.cockpit.pages.createProcessDefinition', ['dataDepend', camCommons.name]);

var Controller = [
  '$scope', '$rootScope', 'Views', 'dataDepend', 'processDefinition', 'page', '$translate',
  function($scope,   $rootScope,   Views,   dataDepend,   processDefinition,   page, $translate) {
    var processData = $scope.processData = dataDepend.create($scope);

    processData.provide('processDefinition', processDefinition);

    $rootScope.showBreadcrumbs = true;

    page.breadcrumbsClear();

    page.breadcrumbsAdd({
      label: $translate.instant('CREATE_PROCESS_DEFINITION')
    });

    page.titleSet($translate.instant('CREATE_PROCESS_DEFINITION'));

    $scope.processDefinition = processDefinition;

    $scope.createProcessDefinitionVars = { read: [ 'processDefinition', 'processData' ] };
    $scope.createProcessDefinitionActions = Views.getProviders({ component: 'cockpit.processDefinition.modeler.action' });
  }];

var RouteConfig = [ '$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/create-process-definition', {
      template: template,
      controller: Controller,
      authentication: 'required',
      resolve: {
        processDefinition : ['ResourceResolver', '$http', 'Uri', '$q',
          function(ResourceResolver, $http, Uri, $q) {
            return ResourceResolver.getByRouteParam('id', {
              name: 'create process definition',
              resolve: function() {
                var deferred = $q.defer();

                $http.get(Uri.appUri('engine://engine/:engine/create-process-definition')).success(function(data) {
                  deferred.resolve(data);
                })
                .error(function(err) {
                  deferred.reject(err);
                });

                return deferred.promise;
              }
            });
          }]
      },
      reloadOnSearch: false
    });
}];

ngModule
  .config(RouteConfig);

module.exports = ngModule;
