'use strict';

module.exports = function(ngModule) {
  ngModule.config(['$httpProvider', function($httpProvider) {
    var interceptor = [function () {
      return {
        'request': function (config) {
          var _u = JSON.parse(localStorage.getItem('_u'));
          if (_u && _u.token) {
            config.headers['X-AUTH-TOKEN'] = _u.token;
            window.uToken = _u.token;
          }
          return config;
        }
      };
    }
    ];
    $httpProvider.interceptors.push(interceptor);
  }]);
};
