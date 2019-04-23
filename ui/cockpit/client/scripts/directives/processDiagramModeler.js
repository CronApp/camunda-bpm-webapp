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
        element.find('[cam-widget-bpmn-viewer]').css({
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

      scope.$watch(attrs.processDefinitionId, function(processDefinitionId) {
        if (processDefinitionId) {
          var elementId = 'processDiagram_' + processDefinitionId.replace(/[.|:]/g, '_');
          element.attr('id', elementId);

          ProcessDefinitionResource.getBpmn20Xml({ id : processDefinitionId }).$promise.then(function(response) {
            loadDiagram(response.bpmn20Xml, element);
          });
        }
      });
    }
  };
}];
