'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/create-process-definition.html', 'utf8');

var angular = require('camunda-commons-ui/vendor/angular');
var camCommons = require('camunda-commons-ui/lib');

var ngModule = angular.module('cam.cockpit.pages.createProcessDefinition', ['dataDepend', camCommons.name]);

var Controller = [
  '$scope',
  '$location',
  '$timeout',
  'Views',
  'Data',
  'dataDepend',
  'page',
  '$translate',
  function(
    $scope,
    $location,
    $timeout,
    Views,
    Data,
    dataDepend,
    page,
    $translate
  ) {
    var $rootScope = $scope.$root;

    console.log('create process definition controller');

    // var processData = $scope.processData = dataDepend.create($scope);

    // $scope.createProcessDefinitionVars = { read: [ ] };
    // $scope.createProcessDefinitionActions = Views.getProviders({ component: 'cockpit.processes.dashboard'});

    $rootScope.showBreadcrumbs = true;

    page.breadcrumbsClear();

    page.breadcrumbsAdd({
      label: $translate.instant('PROCESS_PROCESSES')
    });

    page.titleSet($translate.instant('CREATE_PROCESS_DEFINITION'));
  }];

var RouteConfig = [ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/create-process-definition', {
    template: template,
    controller: Controller,
    authentication: 'required',
    reloadOnSearch: false
  });
}];

ngModule
  .config(RouteConfig);

module.exports = ngModule;
