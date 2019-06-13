'use strict';
module.exports = [
  'ViewsProvider',
  function(
    ViewsProvider
  ) {
    ViewsProvider.registerDefaultView('cockpit.navigation', {
      id: 'new-process-definition',
      label: 'NEW_PROCESS_DEFINITION',
      template: '<!-- nothing to show, but needed -->',
      pagePath: '#/new-process-definition',
      checkActive: function(path) {
        return path.indexOf('#/new-process-definition') > -1;
      },
      controller: function() {},
      priority: 5
    });
  }];
