'use strict';

var fs = require('fs');

var actionTemplate = fs.readFileSync(__dirname + '/deploy-process-definition-action.html', 'utf8');
var dialogTemplate = fs.readFileSync(__dirname + '/deploy-process-definition-dialog.html', 'utf8');
var modalTemplate = fs.readFileSync(__dirname + '/../../../../../client/scripts/repository/resource/plugins/actions/redeploy/modals/cam-cockpit-redeploy-resource-modal.html', 'utf8');

var Controller = ['$scope', '$modal', '$location', function($scope, $modal, $location) {
  $scope.openDialog = function() {
    $modal.open({
      resolve: {
        processDefinition: function() {
          return $scope.processDefinition;
        }
      },
      size: 'lg',
      controller: 'DeployProcessDefinitionController',
      template: dialogTemplate
    });
  };

  $scope.openRedeployDialog = function() {
    $modal.open({
      controller: 'camResourceRedeployModalCtrl',
      template: modalTemplate,
      windowClass: 'redeploy-resource-modal',
      resolve: {
        'resource': function() {
          var arr = $scope.processDefinition.id.split(':'),
              id = arr.length === 3 ? arr[arr.length - 1] : $scope.processDefinition.id;

          return {
            id: id,
            name: $scope.processDefinition.resource
          };
        },
        'deployment': function() {
          return {
            id: $scope.processDefinition.deploymentId
          };
        },
        'control': function() {
          return $scope.control;
        }
      }
    }).result.then(function(deployment) {
      var search = {
        deployment: deployment.id,
        deploymentsQuery: JSON.stringify([{
          type     : 'id',
          operator : 'eq',
          value    : deployment.id
        }])
      };

      $location.path('repository');
      $location.search(search);
      $location.replace();
    });
  };
}];

module.exports = ['ViewsProvider', function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.modeler.action', {
    id: 'deploy-process-definition-action',
    template: actionTemplate,
    controller: Controller,
    priority: 30
  });
}];
