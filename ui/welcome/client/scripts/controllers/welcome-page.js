'use strict';

module.exports = [
  'configuration',
  'AuthenticationService',
  function(configuration, AuthenticationService) {
    AuthenticationService.logout = function() {
      window.location.href = window.location.origin + '/#/home';
    };
    this.appVendor = configuration.getAppVendor();
    this.appName = configuration.getAppName();
  }];
