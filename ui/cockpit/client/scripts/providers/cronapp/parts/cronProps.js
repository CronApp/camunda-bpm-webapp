var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'), is = ModelUtil.is,
  getBusinessObject = ModelUtil.getBusinessObject;

module.exports = function(group, element, bpmnFactory, translate) {

  var blocklyList = [{
    name: 'blocoTeste',
    value: 'Bloco Teste',
    methods: [{name: 'executar', value: 'Executar', parameters: ['abc', 'teste']}, {
      name: 'rodar',
      value: 'Rodar',
      parameters: ['abcd', 'teste2']
    }]
  }, {
    name: 'blocoTeste2',
    value: 'Bloco Teste 2',
    methods: [{name: 'executar2', value: 'Executar2', parameters: ['abc2', 'teste2']}, {
      name: 'rodar2',
      value: 'Rodar2',
      parameters: ['abcd', 'teste2']
    }]
  }];

  var getMethods = function(blocklys) {

  };


  var getValue = function(businessObject) {
    return function(element) {
      return {};
      // TODO - implementar obtenção de valor
    }
  };

  var setValue = function(businessObject) {
    return function(element) {
      console.log(element);
      console.log(businessObject);
      return {};
    }
  };
  var elementBlocklyEntry = entryFactory.comboBox({
    id: 'blockly-select',
    label: 'Blockly',
    selectOptions: blocklyList,
    modelProperty: 'name',
    emptyParameter: true
  });

  var elementMethodsEntry = entryFactory.comboBox({
    id: 'method-select',
    label: 'Methods',
    selectOptions: blocklyList,
    modelProperty: 'name',
    emptyParameter: true
  })

  elementBlocklyEntry.get = getValue(getBusinessObject(element));

  elementBlocklyEntry.set = setValue(getBusinessObject(element));

  elementMethodsEntry.get = getValue(getBusinessObject(element));

  elementMethodsEntry.set = setValue(getBusinessObject(element));

  if(is(element, 'bpmn:ServiceTask')) {
    group.entries.push(elementBlocklyEntry);
    group.entries.push(elementMethodsEntry);
  }
};
