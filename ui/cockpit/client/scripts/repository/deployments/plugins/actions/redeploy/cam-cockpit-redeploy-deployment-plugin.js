'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/cam-cockpit-redeploy-deployment-plugin.html', 'utf8');
var modalTemplate = fs.readFileSync(__dirname + '/modals/cam-cockpit-redeploy-deployment-modal.html', 'utf8');

var Controller = [
  '$scope',
  '$modal',
  '$rootScope',
  function(
    $scope,
    $modal,
    $rootScope
  ) {
    var redeployDeploymentData = $scope.deploymentData.newChild($scope);

    $scope.openRedeployDialog = function($event, deployment) {
      $event.stopPropagation();

      $modal.open({
        controller: 'camRedeployDeploymentModalCtrl',
        template: modalTemplate,
        windowClass: 'redeploy-deployment-modal',
        resolve: {
          'redeployDeploymentData': function() { return redeployDeploymentData; },
          'deployment': function() { return deployment; }
        }
      }).result.then(function() {
        $rootScope.$broadcast('cam-common:cam-searchable:query-force-change');
      });
    };
  }];

var Configuration = function PluginConfiguration(ViewsProvider) {

  ViewsProvider.registerDefaultView('cockpit.repository.deployment.action', {
    id: 'redeploy-deployment',
    template: template,
    controller: Controller,
    priority: 500
  });
};

Configuration.$inject = ['ViewsProvider'];

module.exports = Configuration;
