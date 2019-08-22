'use strict';

var $ = window.jQuery = window.$ = require('jquery'),
    pagesModule = require('./pages/main'),
    directivesModule = require('./directives/main'),
    filtersModule = require('./filters/main'),
    servicesModule = require('./services/main'),
    resourcesModule = require('./resources/main'),
    camCommonsUi = require('camunda-commons-ui/lib'),
    sdk = require('camunda-commons-ui/vendor/camunda-bpm-sdk-angular'),
    angular = require('camunda-commons-ui/vendor/angular'),
    camCommon = require('../../../common/scripts/module'),
    lodash = require('camunda-commons-ui/vendor/lodash');


var APP_NAME = 'cam.admin';

module.exports = function(pluginDependencies) {

  var ngDependencies = [
    'ng',
    'ngResource',
    'pascalprecht.translate',
    camCommonsUi.name,
    directivesModule.name,
    filtersModule.name,
    pagesModule.name,
    resourcesModule.name,
    servicesModule.name
  ].concat(pluginDependencies.map(function(el) {
    return el.ngModuleName;
  }));

  var appNgModule = angular.module(APP_NAME, ngDependencies);

  function getUri(id) {
    var uri = $('base').attr(id);
    if (!id) {
      throw new Error('Uri base for ' + id + ' could not be resolved');
    }

    return uri;
  }

  function $LocaleProvider() {
    this.$get = function() {
      return {
        id: 'pt-BR',
        NUMBER_FORMATS: {
          DECIMAL_SEP: ',',
          GROUP_SEP: '.',
          PATTERNS: [
            { // Decimal Pattern
              minInt: 1,
              minFrac: 0,
              maxFrac: 3,
              posPre: '',
              posSuf: '',
              negPre: '-',
              negSuf: '',
              gSize: 3,
              lgSize: 3
            },{ //Currency Pattern
              minInt: 1,
              minFrac: 2,
              maxFrac: 2,
              posPre: '\u00A4',
              posSuf: '',
              negPre: '-\u00A4',
              negSuf: '',
              gSize: 3,
              lgSize: 3
            }
          ],
          CURRENCY_SYM: 'R$'
        },
        DATETIME_FORMATS: {
          MONTH: 'Janeiro,Fevereiro,Março,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro'
            .split(','),
          SHORTMONTH:  'Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez'.split(','),
          DAY: 'Domingo,Segunda,Terça,Quarta,Quinta,Sexta,Sábado'.split(','),
          SHORTDAY: 'Dom,Seg,Ter,Qua,Qui,Sex,Sab'.split(','),
          AMPMS: ['AM','PM'],
          medium: 'd \'de\' MMM \'de\' y HH:mm:ss',
          short: 'dd/MM/y HH:mm',
          fullDate: 'EEEE, d \'de\' MMMM \'de\' y',
          longDate: 'd \'de\' MMMM \'de\' y',
          mediumDate: 'd \'de\' MMM \'de\' y',
          shortDate: 'dd/MM/y',
          mediumTime: 'HH:mm:ss',
          shortTime: 'HH:mm'
        },
        pluralCat: function(num) {
          if (num === 1) {
            return 'um';
          }
          return 'outro';
        }
      };
    };
  }

  var ModuleConfig = [
    '$routeProvider',
    'UriProvider',
    function(
      $routeProvider,
      UriProvider
    ) {
      $routeProvider.otherwise({ redirectTo: '/' });

      UriProvider.replace(':appName', 'admin');
      UriProvider.replace('app://', getUri('href'));
      UriProvider.replace('cockpitbase://', getUri('app-root') + '/app/cockpit/');
      UriProvider.replace('admin://', getUri('admin-api'));
      UriProvider.replace('plugin://', getUri('admin-api') + 'plugin/');
      UriProvider.replace('engine://', getUri('engine-api'));

      UriProvider.replace(':engine', [ '$window', function($window) {
        var uri = $window.location.href;

        var match = uri.match(/\/app\/admin\/([\w-]+)(|\/)/);
        if (match) {
          return match[1];
        } else {
          throw new Error('no process engine selected');
        }
      }]);
    }];

  appNgModule.provider('configuration', require('./../../../common/scripts/services/cam-configuration')(window.camAdminConf, 'Admin'));
  appNgModule.provider('$locale', $LocaleProvider);

  appNgModule.config(ModuleConfig);

  require('./../../../common/scripts/services/locales')(appNgModule, getUri('app-root'), 'admin');
  require('./../../../common/scripts/services/cron-interceptor')(appNgModule);

  appNgModule.controller('camAdminAppCtrl', [
    '$scope',
    '$route',
    'camAPI',
    'AuthenticationService',
    'TokenService',
    'datepickerPopupConfig',
    function(
      $scope,
      $route,
      camAPI,
      AuthenticationService,
      TokenService,
      datepickerPopupConfig
    ) {
      datepickerPopupConfig.datepickerPopup = 'dd/MM/yyyy';
      datepickerPopupConfig.currentText = 'Hoje';
      datepickerPopupConfig.clearText = 'Limpar';
      datepickerPopupConfig.closeText = 'Feito';

      TokenService.refreshToken();

      AuthenticationService.logout = function() {
        window.location.href = window.location.origin + '/#/home';
      };
      var userService = camAPI.resource('user');
      function getUserProfile(auth) {
        if (!auth || !auth.name) {
          $scope.userFullName = null;
          return;
        }

        userService.profile(auth.name, function(err, info) {
          if (!err) {
            $scope.userFullName = info.firstName + (info.lastName ? ' ' + info.lastName : '');
          }
        });
      }

      $scope.$on('authentication.changed', function(ev, auth) {
        if (auth) {
          getUserProfile(auth);
        }
        else {
          $route.reload();
        }
      });

      getUserProfile($scope.authentication);
    }]);

  if (typeof window.camAdminConf !== 'undefined' && window.camAdminConf.polyfills) {
    var polyfills = window.camAdminConf.polyfills;

    if (polyfills.indexOf('placeholder') > -1) {
      var load = window.requirejs;
      var appRoot = $('head base').attr('app-root');

      load([
        appRoot + '/app/admin/scripts/placeholders.utils.js',
        appRoot + '/app/admin/scripts/placeholders.main.js'
      ], function() {
        load([
          appRoot + '/app/admin/scripts/placeholders.jquery.js'
        ], function() {});
      });
    }
  }

  $(document).ready(function() {
    angular.bootstrap(document.documentElement, [ appNgModule.name, 'cam.admin.custom' ]);

    if (top !== window) {
      window.parent.postMessage({ type: 'loadamd' }, '*');
    }
  });

      /* live-reload
      // loads livereload client library (without breaking other scripts execution)
      $('body').append('<script src="//' + location.hostname + ':LIVERELOAD_PORT/livereload.js?snipver=1"></script>');
      /* */
};

module.exports.exposePackages = function(requirePackages) {
  requirePackages.angular = angular;
  requirePackages.jquery = $;
  requirePackages['camunda-commons-ui'] = camCommonsUi;
  requirePackages['camunda-bpm-sdk-js'] = sdk;
  requirePackages['cam-common'] = camCommon;
  requirePackages['lodash'] = lodash;
};
