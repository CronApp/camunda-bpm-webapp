var inherits = require('inherits');

var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');

var processProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps');
var eventProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps');
var linkProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps');
var documentationProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps');
var idProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps');
var nameProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps');

var cronProps = require('./parts/cronProps');

function createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate) {

  var generalGroup = {
    id: 'general',
    label: 'General',
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, translate);
  processProps(generalGroup, element, translate);

  var detailsGroup = {
    id: 'details',
    label: 'Details',
    entries: []
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

  var documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);

  return[
    generalGroup,
    detailsGroup,
    documentationGroup
  ];
}

// Create the custom magic tab
function createCronTabGroups(element, elementRegistry) {

  // Create a group called "Black Magic".
  var cronappGroup = {
    id: 'cronapp',
    label: 'Cronapp Specific',
    entries: []
  };

  console.log(elementRegistry);

  // Add the spell props to the black magic group.
  cronProps(cronappGroup, element);

  return [
    cronappGroup
  ];
}

function CronPropertiesProvider(
    eventBus, bpmnFactory, elementRegistry,
    translate) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    var generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate)
    };

    // The "magic" tab
    var cronTab = {
      id: 'cronapp',
      label: 'Cronapp',
      groups: createCronTabGroups(element, elementRegistry)
    };

    // Show general + "magic" tab
    return [
      generalTab,
      cronTab
    ];
  };
}

inherits(CronPropertiesProvider, PropertiesActivator);

module.exports = CronPropertiesProvider;