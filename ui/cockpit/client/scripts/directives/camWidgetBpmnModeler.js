'use strict';
var fs = require('fs');

var Modeler = require('./modeler'),

    template = fs.readFileSync(__dirname + '/camWidgetBpmnModeler.html', 'utf8');

module.exports = ['$q', '$document', '$compile', '$location', '$rootScope', 'search', 'debounce',
  function($q, $document, $compile,   $location,   $rootScope,   search, debounce) {

    return {
      scope: {
        diagramData: '=',
        key: '@',
        control: '=?',
        onLoad: '&',
        onClick: '&',
        onMouseEnter: '&',
        onMouseLeave: '&'
      },

      template: template,

      link: function($scope, $element) {

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

        // --- CONTROL FUNCTIONS ---
        $scope.control = $scope.control || {};

        function generateAndConfigureModeler() {
          modeler = Modeler.generateModeler({
            width: '100%',
            height: '100%',
            canvas: {
              deferUpdate: false
            },
            key: $scope.key,
            keyboard: {
              bindTo: window
            }
          });

          if(!modeler.cached) {
            // attach diagram immediately to avoid having the bpmn logo for viewers that are not cached
            attachDiagram();
          }

          // patch show and hide of overlays
          var originalShow = modeler.get('overlays').show.bind(modeler.get('overlays'));
          modeler.get('overlays').show = function() {
            modeler.get('eventBus').fire('overlays.show');
            originalShow();
          };

          var originalHide = modeler.get('overlays').hide.bind(modeler.get('overlays'));
          modeler.get('overlays').hide = function() {
            modeler.get('eventBus').fire('overlays.hide');
            originalHide();
          };

          var showAgain = debounce(function() {
            modeler.get('overlays').show();
          }, 300);

          var originalViewboxChanged = modeler.get('canvas')._viewboxChanged.bind(modeler.get('canvas'));
          var debouncedOriginal = debounce(function() {
            originalViewboxChanged();
            modeler.get('overlays').hide();
            showAgain();
          }, 0);
          modeler.get('canvas')._viewboxChanged = function() {
            debouncedOriginal();
          };

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
            setupEventListeners();
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

          var mouseReleaseCallback = function() {
            $scope.grabbing = false;
            document.removeEventListener('mouseup', mouseReleaseCallback);
            $scope.$apply();
          };

          function onClick(e) {
            $scope.onClick({element: e.element, $event: e.originalEvent});
          }

          function onHover(e) {
            $scope.onMouseEnter({element: e.element, $event: e.originalEvent});
          }

          function onOut(e) {
            $scope.onMouseLeave({element: e.element, $event: e.originalEvent});
          }

          function onMousedown() {
            $scope.grabbing = true;
            document.addEventListener('mouseup', mouseReleaseCallback);
            $scope.$apply();
          }

          var onViewboxChange = debounce(function(e) {
            var viewbox = JSON.parse(($location.search() || {}).viewbox || '{}');

            viewbox[definitions.id] = {
              x: e.viewbox.x,
              y: e.viewbox.y,
              width: e.viewbox.width,
              height: e.viewbox.height
            };

            search.updateSilently({
              viewbox: JSON.stringify(viewbox)
            });

            var phase = $rootScope.$$phase;
            if (phase !== '$apply' && phase !== '$digest') {
              $scope.$apply(function() {
                $location.replace();
              });
            } else {
              $location.replace();
            }
          }, 500);


          function setupEventListeners() {
            var eventBus = modeler.get('eventBus');
            eventBus.on('element.click', onClick);
            eventBus.on('element.hover', onHover);
            eventBus.on('element.out', onOut);
            eventBus.on('element.mousedown', onMousedown);
            eventBus.on('canvas.viewbox.changed', onViewboxChange);
          }

          function clearEventListeners() {
            var eventBus = modeler.get('eventBus');
            eventBus.off('element.click', onClick);
            eventBus.off('element.hover', onHover);
            eventBus.off('element.out', onOut);
            eventBus.off('element.mousedown', onMousedown);
            eventBus.off('canvas.viewbox.changed', onViewboxChange);
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
            clearEventListeners();
            modeler.get('overlays').clear();
            Modeler.cacheModeler({ key: $scope.key, modeler: modeler });
          });
        }

        generateAndConfigureModeler();
      }
    };
  }];
