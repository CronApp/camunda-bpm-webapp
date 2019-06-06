'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/cam-cockpit-deploy.html', 'utf8');

module.exports = [function() {
  return {
    restrict: 'A',
    template: template,
    controller: 'camDeployCtrl',
    scope: {
      onDeployed: '&camDeploy'
    }
  };
}];
