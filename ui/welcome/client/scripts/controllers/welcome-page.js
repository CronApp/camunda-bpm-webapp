'use strict';

module.exports = [
  'configuration',
  'AuthenticationService',
  'TokenService',
  function(configuration, AuthenticationService, TokenService) {
    TokenService.refreshToken();

    AuthenticationService.logout = function() {
      window.location.href = window.location.origin + '/#/home';
    };
    this.appVendor = configuration.getAppVendor();
    this.appName = configuration.getAppName();
  }];
