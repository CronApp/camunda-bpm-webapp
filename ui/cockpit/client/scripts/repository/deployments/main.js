'use strict';

var angular = require('camunda-commons-ui/vendor/angular'),

    /* controller */
    camCockpitDeploymentsCtrl = require('./controllers/cam-cockpit-deployments-ctrl'),
    camCockpitDeployCtrl = require('./controllers/cam-cockpit-deploy-ctrl'),
    camCockpitDeploymentModalCtrl = require('./controllers/cam-cockpit-deployment-modal-ctrl'),

    /* directives */
    camCockpitDeployments = require('./directives/cam-cockpit-deployments'),
    camCockpitDeployment = require('./directives/cam-cockpit-deployment'),
    camCockpitDeploymentsSortingChoices = require('./directives/cam-cockpit-deployments-sorting-choices'),
    camCockpitDeploy = require('./directives/cam-cockpit-deploy'),

    /* plugins */
    camCockpitDeleteDeploymentPlugin = require('./plugins/actions/delete/cam-cockpit-delete-deployment-plugin'),
    camCockpitRedeployDeploymentPlugin = require('./plugins/actions/redeploy/cam-cockpit-redeploy-deployment-plugin'),

    /* modals */
    camCockpitDeleteDeploymentModalCtrl = require('./plugins/actions/delete/modals/cam-cockpit-delete-deployment-modal-ctrl'),
    camCockpitRedeployDeploymentModalCtrl = require('./plugins/actions/redeploy/modals/cam-cockpit-redeploy-deployment-modal-ctrl');

var deploymentsModule = angular.module('cam.cockpit.repository.deployments', [
  'ui.bootstrap'
]);

  /* controllers */
deploymentsModule.controller('camDeploymentsCtrl', camCockpitDeploymentsCtrl);
deploymentsModule.controller('camDeployCtrl', camCockpitDeployCtrl);
deploymentsModule.controller('camDeploymentModalCtrl', camCockpitDeploymentModalCtrl);

  /* directives */
deploymentsModule.directive('camDeployments', camCockpitDeployments);
deploymentsModule.directive('camDeployment', camCockpitDeployment);
deploymentsModule.directive('camDeploymentsSortingChoices', camCockpitDeploymentsSortingChoices);
deploymentsModule.directive('camDeploy', camCockpitDeploy);

  /* plugins */
deploymentsModule.config(camCockpitDeleteDeploymentPlugin);
deploymentsModule.config(camCockpitRedeployDeploymentPlugin);

  /* modals */
deploymentsModule.controller('camDeleteDeploymentModalCtrl', camCockpitDeleteDeploymentModalCtrl);
deploymentsModule.controller('camRedeployDeploymentModalCtrl', camCockpitRedeployDeploymentModalCtrl);

module.exports = deploymentsModule;
