'use strict';

var fs = require('fs');

var createProcessDefinitionActionTemplate = fs.readFileSync(__dirname + '/cam-cockpit-navbar-action-create-process-definition-plugin.html', 'utf8');
var createProcessDefinitionModalTemplate = fs.readFileSync(__dirname + '/modals/cam-cockpit-create-process-definition-modal.html', 'utf8');

var Controller = [
  '$scope',
  '$modal',
  '$timeout',
  function(
    $scope,
    $modal,
    $timeout
  ) {

    $scope.open = function() {
      var modalInstance = $modal.open({
        size: 'lg',
        controller: 'camCreateProcessDefinitionModalCtrl',
        template: createProcessDefinitionModalTemplate
      });

      modalInstance.result.then(function() {
        $scope.$root.$broadcast('refresh');
        document.querySelector('.create-process-definition-action a').focus();
      }, function() {
        document.querySelector('.create-process-definition-action a').focus();
      });

      modalInstance.opened.then(function() {
        $timeout(function() {
          $timeout(function() {
            document.querySelectorAll('div.modal-content input')[0].focus();
          });
        });
      });
    };

  }];

var Configuration = function PluginConfiguration(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.navbar.action', {
    id: 'create-process-definition-action',
    template: createProcessDefinitionActionTemplate,
    controller: Controller,
    priority: 200
  });
};

Configuration.$inject = ['ViewsProvider'];

module.exports = Configuration;
