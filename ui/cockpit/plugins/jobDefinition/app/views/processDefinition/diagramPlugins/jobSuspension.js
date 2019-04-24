'use strict';

var angular = require('angular');
var fs = require('fs');

var template = fs.readFileSync(__dirname + '/jobSuspension.html', 'utf8');

module.exports = ['ViewsProvider',  function(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.diagram.plugin', {
    id: 'activity-instance-statistics-overlay',
    overlay: [
      '$scope', 'control', 'processData', 'processDiagram',
      function($scope, control, processData, processDiagram) {
        var viewer = control.getModeler();
        var overlays = viewer.get('overlays');
        var elementRegistry = viewer.get('elementRegistry');

        var overlaysNodes = {};

        processData.observe(['jobDefinitions'], function(jobDefinitions) {

          elementRegistry.forEach(function(shape) {
            var element = processDiagram.bpmnElements[shape.businessObject.id];
            var definitionsForElement = getElementDefinitions(element, jobDefinitions);

            if (definitionsForElement.length > 0) {
              element.isSelectable = true;
            }

            function isSuspended() {
              return definitionsForElement.some(function(definition) {
                return definition.suspended;
              });
            }

            $scope.$watch(isSuspended, function(suspended) {
              var node = overlaysNodes[element.id];

              if (!node && suspended) {
                node = angular.element(template);

                overlays.add(element.id, {
                  position: {
                    top: 0,
                    right: 0
                  },
                  show: {
                    minZoom: -Infinity,
                    maxZoom: +Infinity
                  },
                  html: node[0]
                });

                overlaysNodes[element.id] = node;
              }

              if (node) {
                if (suspended) {
                  node.show();
                  node.tooltip({
                    container: 'body',
                    title: 'Suspended Job Definition',
                    placement: 'top'
                  });
                } else {
                  node.hide();
                }
              }
            });
          });
        });

        function getElementDefinitions(element, jobDefinitions) {
          return jobDefinitions.filter(function(definition) {
            return definition.activityId === element.id;
          });
        }
      }
    ]
  });
}];
