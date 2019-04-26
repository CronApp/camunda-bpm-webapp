'use strict';
var fs = require('fs');

var Modeler = require('./util/modeler'),

    propertiesPanel = require('bpmn-js-properties-panel'),
    propertiesProvider = require('bpmn-js-properties-panel/lib/provider/bpmn'),
    camundaPropertiesProvider = require('bpmn-js-properties-panel/lib/provider/camunda'),
    minimap = require('diagram-js-minimap'),
    camundaModdle = require('camunda-bpmn-moddle/resources/camunda'),

    template = fs.readFileSync(__dirname + '/camWidgetBpmnModeler.html', 'utf8');

module.exports = ['$q', '$document', '$compile', '$location',
  function($q, $document, $compile,   $location) {

    return {
      scope: {
        diagramData: '=',
        key: '@',
        control: '=?',
        onLoad: '&'
      },

      template: template,

      link: function($scope, $element) {

        console.log('minimap=' + JSON.stringify(minimap));

        var modeler = null;
        var canvas = null;
        var definitions;
        var diagramContainer = $element[0].querySelector('.diagram-holder');

        function attachDiagram() {
          diagramContainer.appendChild(modeler._container);
        }

        function detatchDiagram() {
          diagramContainer.removeChild(modeler._container);
        }

        $scope.grabbing = false;

        $scope.control = $scope.control || {};

        function generateAndConfigureModeler() {
          modeler = Modeler.generateModeler({
            container: '#canvas',
            propertiesPanel: {
              parent: '#properties'
            },
            additionalModules: [
              propertiesPanel,
              propertiesProvider,
              camundaPropertiesProvider,
              minimap
            ],
            canvas: {
              deferUpdate: false
            },
            key: $scope.key,
            keyboard: {
              bindTo: window
            },
            moddleExtensions: {
              camundaModdle
            }
          });

          modeler.on('commandStack.changed', function() {
            console.log('commandStack.changed');
          });

          // if(!modeler.cached) {
          //   // attach diagram immediately to avoid having the bpmn logo for viewers that are not cached
          //   attachDiagram();
          // }

          var diagramData = null;

          $scope.$watch('diagramData', function(newValue) {
            if (newValue) {
              diagramData = newValue;
              renderDiagram();
            }
          });

          function handleModelerLoad() {
            canvas = modeler.get('canvas');
            definitions = modeler._definitions;
            zoom();
            $scope.loaded = true;
          }

          function renderDiagram() {
            // if there is a cached modeler, no need to import data
            if(modeler.cached) {
              attachDiagram();
              handleModelerLoad();
              return $scope.onLoad();
            } else if (diagramData) {
              $scope.loaded = false;

              var useDefinitions = (typeof diagramData === 'object');

              var importFunction = (useDefinitions ? modeler.importDefinitions : modeler.importXML).bind(modeler);

              importFunction(diagramData, function(err, warn) {
                var applyFunction = useDefinitions ? function(fn) {fn();} : $scope.$apply.bind($scope);

                applyFunction(function() {
                  if (err) {
                    $scope.error = err;
                    return;
                  }

                  $scope.warn = warn;

                  handleModelerLoad();
                  return $scope.onLoad();
                });
              });
            }
          }

          function zoom() {
            if (canvas) {
              var viewbox = JSON.parse(($location.search() || {}).viewbox || '{}')[definitions.id];

              if (viewbox) {
                canvas.viewbox(viewbox);
              }
              else {
                canvas.zoom('fit-viewport', 'auto');
              }
            }
          }

          $scope.zoomIn = function() {
            modeler.get('zoomScroll').zoom(1, {
              x: $element[0].offsetWidth / 2,
              y: $element[0].offsetHeight / 2
            });
          };

          $scope.zoomOut = function() {
            modeler.get('zoomScroll').zoom(-1, {
              x: $element[0].offsetWidth / 2,
              y: $element[0].offsetHeight / 2
            });
          };

          $scope.resetZoom = function() {
            canvas.resized();
            canvas.zoom('fit-viewport', 'auto');
          };

          $scope.control.resetZoom = $scope.resetZoom;

          $scope.control.refreshZoom = function() {
            canvas.resized();
            canvas.zoom(canvas.zoom(), 'auto');
          };

          $scope.$on('$destroy', function() {
            detatchDiagram();
            modeler.get('overlays').clear();
            Modeler.cacheModeler({ key: $scope.key, modeler: modeler });
          });
        }

        generateAndConfigureModeler();
      }
    };
  }];
