'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/processDiagramModeler.html', 'utf8');

var angular = require('camunda-commons-ui/vendor/angular');

module.exports = ['ProcessDefinitionResource', 'debounce', function(ProcessDefinitionResource, debounce) {
  return {
    restrict: 'EAC',
    template: template,
    controller: ['$scope', function($scope) {
      $scope.control = {};
    }],
    link: function(scope, element, attrs) {
      function applyCss(element) {
        element.find('[cam-widget-bpmn-modeler]').css({
          width : parseInt(element.parent().width(), 10),
          height : element.parent().height()
        });
      }

      function loadDiagram(bpmnXml, element) {
        scope.diagramXML = bpmnXml;

        applyCss(element);

        var debouncedZoom = debounce(function() {
          scope.control.resetZoom();
          scope.control.resetZoom();
        }, 500);

        angular.element(window).on('resize', function() {
          applyCss(element);
          debouncedZoom();
        });
      }

      function setElementId(id) {
        if (id) {
          var elementId = 'processDiagram_' + id.replace(/[.|:]/g, '_');
          element.attr('id', elementId);
        }
      }

      scope.$watch(attrs.processDefinitionId, function(processDefinitionId) {
        if (processDefinitionId) {
          setElementId(processDefinitionId);

          ProcessDefinitionResource.getBpmn20Xml({ id : processDefinitionId }).$promise.then(function(response) {
            if (scope.processDefinition) {
              scope.processDefinition.bpmn20Xml = response.bpmn20Xml;
            } else {
              scope.processDefinition = response;
            }

            loadDiagram(response.bpmn20Xml, element);
          });
        }
      });

      scope.$watch(attrs.processDefinition, function(processDefinition) {
        if (processDefinition) {
          setElementId(processDefinition.id);
          loadDiagram(processDefinition.bpmn20Xml, element);
        }
      });
    }
  };
}];
