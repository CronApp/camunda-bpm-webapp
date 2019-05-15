var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports = function(group, element) {
  if (is(element, 'bpmn:StartEvent')) {
    group.entries.push(entryFactory.textField({
      id: 'cronapp',
      description: 'Cronapp Teste',
      label: 'Cronapp',
      modelProperty: 'cronapp'
    }));
  }
};