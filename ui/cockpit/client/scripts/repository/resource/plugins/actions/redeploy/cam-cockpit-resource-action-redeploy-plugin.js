'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/cam-cockpit-resource-action-redeploy-plugin.html', 'utf8');
var modalTemplate = fs.readFileSync(__dirname + '/modals/cam-cockpit-redeploy-resource-modal.html', 'utf8');

var Controller = [
  '$scope',
  '$modal',
  '$rootScope',
  function(
    $scope,
    $modal,
    $rootScope
  ) {
    $scope.openRedeployDialog = function(deployment, resource) {
      $modal.open({
        controller: 'camResourceRedeployModalCtrl',
        template: modalTemplate,
        windowClass: 'redeploy-resource-modal',
        resolve: {
          'resource': function() {
            return resource;
          },
          'deployment': function() {
            return deployment;
          },
          'control': function() {
            return $scope.control;
          }
        }
      }).result.then(function() {
        $rootScope.$broadcast('cam-common:cam-searchable:query-force-change');
      });
    };
  }];

var Configuration = function PluginConfiguration(ViewsProvider) {

  ViewsProvider.registerDefaultView('cockpit.repository.resource.action', {
    id: 'redeploy-resource',
    controller: Controller,
    template: template,
    priority: 200
  });
};

Configuration.$inject = ['ViewsProvider'];

module.exports = Configuration;
