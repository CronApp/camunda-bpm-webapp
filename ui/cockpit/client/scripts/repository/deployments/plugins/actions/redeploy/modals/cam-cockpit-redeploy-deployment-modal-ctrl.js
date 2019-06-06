'use strict';

module.exports = [
  '$scope',
  '$modalInstance',
  '$timeout',
  '$location',
  'camAPI',
  'Notifications',
  'routeUtil',
  'redeployDeploymentData',
  'deployment',
  '$translate',
  function(
    $scope,
    $modalInstance,
    $timeout,
    $location,
    camAPI,
    Notifications,
    routeUtil,
    redeployDeploymentData,
    deployment,
    $translate
  ) {
    var Deployment = camAPI.resource('deployment');

    $scope.deployment = deployment;

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

    var getDeploymentUrl = function(deployment) {
      var path = '#/repository';

      var searches = {
        deployment: deployment.id,
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
        'deploymentsQuery',
        'deploymentsSortBy',
        'deploymentsSortOrder'
      ]);
    };

    var successNotification = function(deployment) {
      Notifications.addMessage({
        status: $translate.instant('PLGN_REDE_NOTIFICATIONS_SUCCESS'),
        message: $translate.instant('PLGN_REDE_NOTIFICATIONS_SUCCESS_MSG', {
          deployment: deployment.name || deployment.id
        }) + '<br/><a href="' + getDeploymentUrl(deployment) + '">' + $translate.instant('PLGN_REDE_NOTIFICATIONS_SUCCESS_MSG_SEE') + '</a>',
        exclusive: true,
        unsafe: true
      });
    };

    var errorNotification = function(err, deployment) {
      Notifications.addError({
        status: $translate.instant('PLGN_REDE_NOTIFICATIONS_FAILED'),
        message: $translate.instant('PLGN_REDE_NOTIFICATIONS_FAILED_MSG', {
          deployment: deployment.name || deployment.id,
          err: err.message
        }),
        exclusive: true,
        scope: $scope
      });
    };

    $scope.redeploy = function(deployment) {
      $scope.status = 'LOADING';

      var options = {
        id: deployment.id,
        tenantId: deployment.tenantId,
        source: 'cockpit'
      };

      Deployment.redeploy(options, function(err, deployment) {
        $scope.status = null;

        if (err) {
          return errorNotification(err, deployment);
        }

        executeAfterDestroy.push(function() {
          successNotification(deployment);
        });

        $modalInstance.close(deployment);
      });
    };
  }];
