'use strict';
module.exports = [
  'ViewsProvider',
  function(
    ViewsProvider
  ) {
    ViewsProvider.registerDefaultView('cockpit.navigation', {
      id: 'create-process-definition',
      label: 'CREATE_PROCESS_DEFINITION',
      template: '<!-- nothing to show, but needed -->',
      pagePath: '#/create-process-definition',
      checkActive: function(path) {
        return path.indexOf('#/create-process-definition') > -1;
      },
      controller: function() {},
      priority: 5
    });
  }];
