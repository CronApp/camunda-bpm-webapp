'use strict';

module.exports = [
  '$scope',
  '$modalInstance',
  '$timeout',
  '$location',
  'camAPI',
  'Notifications',
  'routeUtil',
  'resource',
  'deployment',
  'control',
  '$translate',
  function(
    $scope,
    $modalInstance,
    $timeout,
    $location,
    camAPI,
    Notifications,
    routeUtil,
    resource,
    deployment,
    control,
    $translate
  ) {
    var Deployment = camAPI.resource('deployment');

    $scope.deployment = deployment;
    $scope.resource = resource;
    $scope.control = control;

    var executeAfterDestroy = [];

    $scope.$on('$destroy', function() {
      var job;
      while((job = executeAfterDestroy.pop())) {
        if (typeof job === 'function') {
          $timeout(job);
        }
      }
    });

    $scope.$on('$routeChangeStart', function() {
      $scope.$dismiss();
    });

    var getDeploymentUrl = function(deployment, resource) {
      var path = '#/repository';

      var searches = {
        deployment: deployment.id,
        resourceName: resource.name,
        deploymentsQuery: JSON.stringify([{
          type: 'id',
          operator: 'eq',
          value: deployment.id
        }])
      };

      var searchParams = $location.search() || {};
      if (searchParams['deploymentsSortBy']) {
        searches['deploymentsSortBy'] = searchParams['deploymentsSortBy'];
      }

      if (searchParams['deploymentsSortOrder']) {
        searches['deploymentsSortOrder'] = searchParams['deploymentsSortOrder'];
      }

      return routeUtil.redirectTo(path, searches, [
        'deployment',
        'resourceName',
        'deploymentsQuery',
        'deploymentsSortBy',
        'deploymentsSortOrder'
      ]);
    };

    var successNotification = function(deployment, resource) {
      Notifications.addMessage({
        status: $translate.instant('PLGN_REDE_NOTIFICATIONS_SUCCESS'),
        message: $translate.instant('PLGN_REDE_RES_NOTIFICATIONS_SUCCESS_MSG', {
          resource: resource.name || resource.id
        }) + '<br/><a href="' + getDeploymentUrl(deployment, resource) + '">' + $translate.instant('PLGN_REDE_NOTIFICATIONS_SUCCESS_MSG_SEE') + '</a>',
        scope: $scope,
        unsafe: true
      });
    };

    var errorNotification = function(err, resource) {
      Notifications.addError({
        status: $translate.instant('PLGN_REDE_NOTIFICATIONS_FAILED'),
        message: $translate.instant('PLGN_REDE_RES_NOTIFICATIONS_FAILED_MSG', {
          resource: resource.name || resource.id,
          err: err.message
        }),
        exclusive: true,
        scope: $scope
      });
    };

    $scope.redeploy = function(deployment, resource) {
      $scope.status = 'LOADING';

      var options = {
        id: deployment.id,
        source: 'cockpit',
        resourceIds: [resource.id]
      };

      Deployment.redeploy(options, function(err, deployment) {
        $scope.status = null;

        if (err) {
          return errorNotification(err, resource);
        }

        executeAfterDestroy.push(function() {
          successNotification(deployment, resource);
        });

        $modalInstance.close(deployment);
      });
    };
  }];
