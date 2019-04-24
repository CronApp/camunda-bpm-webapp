'use strict';
var fs = require('fs');

var angular = require('camunda-bpm-sdk-js/vendor/angular'),

    Modeler = require('./modeler'),

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

        $scope.control.highlight = function(id) {
          canvas.addMarker(id, 'highlight');

          $element.find('[data-element-id="'+id+'"]>.djs-outline').attr({
            rx: '14px',
            ry: '14px'
          });
        };

        $scope.control.clearHighlight = function(id) {
          canvas.removeMarker(id, 'highlight');
        };

        $scope.control.isHighlighted = function(id) {
          return canvas.hasMarker(id, 'highlight');
        };

        // removes all badges for an element with a given id
        $scope.control.removeBadges = function(id) {
          modeler.get('overlays').remove({element:id});
        };

        // removes a single badge with a given id
        $scope.control.removeBadge = function(id) {
          modeler.get('overlays').remove(id);
        };

        $scope.control.getModeler = function() {
          return modeler;
        };

        $scope.control.scrollToElement = function(element) {
          var height, width, x, y;

          var elem = modeler.get('elementRegistry').get(element);
          var viewbox = canvas.viewbox();

          height = Math.max(viewbox.height, elem.height);
          width  = Math.max(viewbox.width,  elem.width);

          x = Math.min(Math.max(viewbox.x, elem.x - viewbox.width + elem.width), elem.x);
          y = Math.min(Math.max(viewbox.y, elem.y - viewbox.height + elem.height), elem.y);

          canvas.viewbox({
            x: x,
            y: y,
            width: width,
            height: height
          });
        };

        $scope.control.getElement = function(elementId) {
          return modeler.get('elementRegistry').get(elementId);
        };

        $scope.control.getElements = function(filter) {
          return modeler.get('elementRegistry').filter(filter);
        };

        $scope.loaded = false;
        $scope.control.isLoaded = function() {
          return $scope.loaded;
        };

        $scope.control.addAction = function(config) {
          var container = $element.find('.actions');
          var htmlElement = config.html;
          container.append(htmlElement);
          $compile(htmlElement)($scope);
        };

        var heatmapImage;

        $scope.control.addImage = function(image, x, y) {
          return preloadImage(image)
            .then(
              function(preloadedElement) {
                var width = preloadedElement.offsetWidth;
                var height = preloadedElement.offsetHeight;
                var imageElement = $document[0].createElementNS('http://www.w3.org/2000/svg', 'image');

                imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', image);
                imageElement.setAttributeNS(null, 'width', width);
                imageElement.setAttributeNS(null, 'height', height);
                imageElement.setAttributeNS(null, 'x', x);
                imageElement.setAttributeNS(null, 'y', y);

                $document[0].body.removeChild(preloadedElement);
                canvas._viewport.appendChild(imageElement);

                heatmapImage = angular.element(imageElement);
                return heatmapImage;
              },
              function(preloadedElement) {
                $document[0].body.removeChild(preloadedElement);
              }
            );
        };

        function preloadImage(img) {
          var body = $document[0].body;
          var deferred = $q.defer();
          var imageElement = angular.element('<img>')
            .css('position', 'absolute')
            .css('left', '-9999em')
            .css('top', '-9999em')
            .attr('src', img)[0];

          imageElement.onload = function() {
            deferred.resolve(imageElement);
          };

          imageElement.onerror = function() {
            deferred.reject(imageElement);
          };

          body.appendChild(imageElement);

          return deferred.promise;
        }

        function generateAndConfigureModeler() {
          modeler = Modeler.generateModeler({
            width: '100%',
            height: '100%',
            canvas: {
              deferUpdate: false
            },
            key: $scope.key
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
