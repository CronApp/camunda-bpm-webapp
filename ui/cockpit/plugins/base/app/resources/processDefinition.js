'use strict';

module.exports = ['$resource', 'Uri', function($resource, Uri) {
  return $resource(Uri.appUri('plugin://base/:engine/process-definition/:id/:action'), { id: '@id', name: '@name' }, {
    getCalledProcessDefinitions: {
      method: 'POST',
      isArray: true,
      params: {
        action: 'called-process-definitions'
      }
    },
    createNewProcessDefinition: {
      method: 'POST',
      isArray: false,
      params: {
        action: 'create-new-process-definition'
      }
    }
  });
}];
