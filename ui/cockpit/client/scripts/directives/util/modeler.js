'use strict';

var Modeler = require('bpmn-js/dist/bpmn-modeler.production.min');

var modelers = {};

module.exports = {
  generateModeler: generateModeler,
  cacheModeler: cacheModeler
};

function generateModeler(options) {

  // get cached modeler if it exists
  var cachedModeler = options.key && modelers[options.key];
  if(cachedModeler) {
    cachedModeler.cached = true;
    return cachedModeler;
  }

  // return a new bpmn modeler
  var BpmnModeler = Modeler;
  return new BpmnModeler(options);
}

function cacheModeler(options) {
  return options.key && (modelers[options.key] = options.modeler);
}

