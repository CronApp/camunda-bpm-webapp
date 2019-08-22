'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/execution-metrics.html', 'utf8');
var CamSDK = require('camunda-commons-ui/vendor/camunda-bpm-sdk');

var Controller = [
  '$scope',
  'Uri',
  'camAPI',
  'fixDate',
  '$translate',
  function($scope, Uri, camAPI, fixDate, $translate) {

    var MetricsResource = camAPI.resource('metrics');

    // date variables
    var now = new Date();
    var dateFormat = 'dd/MM/yyyy';

    // initial scope data
    $scope.startDate = new Date(now.getFullYear(), 0, 1);
    $scope.endDate =   new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    $scope.loadingState = 'INITIAL';

    // sets loading state to error and updates error message
    function setLoadingError(error) {
      $scope.loadingState = 'ERROR';
      $scope.loadingError = error;
    }

    $scope.open = function($event, field) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope[field] = true;
    };

    // called every time date input changes
    $scope.handleDateChange = function handleDateChange() {
      var form = $scope.form;
      if(form.$valid) {
        return load();
      } else if(form.startDate.$error.datePattern || form.endDate.$error.datePattern) {
        setLoadingError($translate.instant('EXECUTION_METRICS_SUPPORTED_PATTERN_ERROR', { dateFormat: dateFormat }))
      } else if(form.startDate.$error.dateValue || form.endDate.$error.dateValue) {
        setLoadingError($translate.instant('EXECUTION_METRICS_INVALID_DATE_VALUE_ERROR'));
      }
    };

    var load = $scope.load = function() {
      $scope.loadingState = 'LOADING';
      // promises??? NOPE!
      CamSDK.utils.series({
        flowNodes: function(cb) {
          MetricsResource.sum({
            name: 'activity-instance-start',
            startDate: fixDate($scope.startDate),
            endDate: fixDate($scope.endDate)
          }, function(err, res) {
            cb(err, !err ? res.result : null);
          });
        },
        decisionElements: function(cb) {
          MetricsResource.sum({
            name: 'executed-decision-elements',
            startDate: fixDate($scope.startDate),
            endDate: fixDate($scope.endDate)
          }, function(err, res) {
            cb(err, !err ? res.result : null);
          });
        }
      }, function(err, res) {
        $scope.loadingState = 'LOADED';
        if (err) {
          setLoadingError($translate.instant('EXECUTION_METRICS_COULD_NOT_SET_START_AND_END_DATES_ERROR'));
          $scope.loadingState = 'ERROR';
          return;
        }
        $scope.metrics = res;
      });
    };

    load();
  }];

module.exports = ['ViewsProvider', function PluginConfiguration(ViewsProvider) {
  ViewsProvider.registerDefaultView('admin.system', {
    id: 'system-settings-metrics',
    label: 'EXECUTION_METRICS',
    template: template,
    controller: Controller,
    priority: 900
  });
}];
