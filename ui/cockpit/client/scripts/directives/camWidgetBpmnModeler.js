'use strict';

var fs = require('fs');

var angular = require('angular');

var Modeler = require('./util/modeler'),
    propertiesPanel = require('bpmn-js-properties-panel'),
    propertiesProvider = require('bpmn-js-properties-panel/lib/provider/bpmn'),
    camundaPropertiesProvider = require('bpmn-js-properties-panel/lib/provider/camunda'),
    minimap = require('diagram-js-minimap'),
    translations = require('../locales/customTranslate'),
    camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda'),
    cronModdle = require('../providers/cronapp/moddle/cronappModdle'),
    template = fs.readFileSync(__dirname + '/camWidgetBpmnModeler.html', 'utf8');

module.exports = ['$q', '$document', '$compile', '$location', 'debounce',
  function($q, $document, $compile, $location, debounce) {
    return {
      scope: {
        processDefinition: '=',
        diagramData: '=',
        key: '@',
        control: '=?',
        onLoad: '&'
      },
      template: template,
      link: function($scope, $element) {
        var modeler = null;
        var canvas = null;
        var definitions;
        var diagramContainer = $element[0].querySelector('.diagram-holder');
        var customTranslateModule = {
          translate: ['value', translations]
        };

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
              minimap,
              customTranslateModule
            ],
            moddleExtensions: {
              camunda: camundaModdleDescriptor,
              cronapp: cronModdle
            },
            canvas: {
              deferUpdate: false
            },
            key: $scope.key,
            keyboard: {
              bindTo: window
            }
          });

          function saveDiagram() {
            modeler.saveXML({ format: true }, function(err, xml) {
              if (err) {
                console.error(err);
              } else {
                $scope.processDefinition.bpmn20Xml = xml;
              }
            });
          }

          var saveArtifact = debounce(function() {
            saveDiagram();
          }, 500);

          modeler.on('commandStack.changed', saveArtifact);

          if(!modeler.cached) {
            // attach diagram immediately to avoid having the bpmn logo for viewers that are not cached
            attachDiagram();
          }

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
            disableIsExecutableFlag();
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
              } else {
                canvas.zoom('fit-viewport', 'auto');
              }
            }
          }

          function disableIsExecutableFlag() {
            var isExecutable = angular.element(document.querySelector('#camunda-process-is-executable'));
            if (isExecutable) {
              isExecutable.prop('disabled', true);
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
