/**
 * @namespace cam.cockpit.plugin.base.views
 */
'use strict';

var angular = require('angular'),
    camCommon = require('cam-common'),
    diagramInstancePlugins = require('./processInstance/diagramPlugins'),
    diagramDefinitionPlugins = require('./processDefinition/diagramPlugins'),
    // dashboard
    dashboardDeployments = require('./dashboard/deployments'),
    dashboardReports = require('./dashboard/reports'),
    dashboardBatches = require('./dashboard/batches'),
    dashboardProcesses = require('./dashboard/processes'),
    dashboardDecisions = require('./dashboard/decisions'),
    dashboardTasks = require('./dashboard/tasks'),
    dashboardProcessDefinition = require('./dashboard/processDefinition'),

    // processes dashboard
    processDefinitions = require('./processesDashboard/process-definitions'),

    // process definition
    processInstanceTable = require('./processDefinition/processInstanceTable'),
    calledProcessDefinitionTable = require('./processDefinition/calledProcessDefinitionTable'),
    // updateSuspensionStateAction = require('./processDefinition/updateSuspensionStateAction'),
    // updateSuspensionStateDialog = require('./processDefinition/updateSuspensionStateDialog'),
    editProcessDefinitionAction = require('./processDefinition/editProcessDefinitionAction'),
    editProcessDefinitionDialog = require('./processDefinition/editProcessDefinitionDialog'),
    pdIncidentsTab = require('./processDefinition/pdIncidentsTab'),
    deleteProcessDefinitionAction = require('./processDefinition/deleteProcessDefinitionAction'),
    deleteProcessDefinitionDialog = require('./processDefinition/deleteProcessDefinitionDialog'),

    // edit process definition
    saveProcessDefinitionAction = require('./editProcessDefinition/saveProcessDefinitionAction'),
    deployProcessDefinitionAction = require('./editProcessDefinition/deployProcessDefinitionAction'),
    deployProcessDefinitionDialog = require('./editProcessDefinition/deployProcessDefinitionDialog'),

    // process instance
    variableInstancesTab = require('./processInstance/variableInstancesTab'),
    incidentsTab = require('./processInstance/incidentsTab'),
    calledProcessInstanceTable = require('./processInstance/calledProcessInstanceTable'),
    userTasksTable = require('./processInstance/userTasksTable'),
    jobRetryBulkAction = require('./processInstance/jobRetryBulkAction'),
    jobRetryBulkDialog = require('./processInstance/jobRetryBulkDialog'),
    jobRetryDialog = require('./processInstance/jobRetryDialog'),
    externalTaskRetryDialog = require('./processInstance/externalTaskRetryDialog'),
    cancelProcessInstanceAction = require('./processInstance/cancelProcessInstanceAction'),
    cancelProcessInstanceDialog = require('./processInstance/cancelProcessInstanceDialog'),
    addVariableAction = require('./processInstance/addVariableAction'),
    updateSuspensionStateActionPI = require('./processInstance/updateSuspensionStateAction'),
    updateSuspensionStateDialogPI = require('./processInstance/updateSuspensionStateDialog'),
    incidentJobRetryAction = require('./processInstance/incidentJobRetryAction'),
    incidentExternalTaskRetryAction = require('./processInstance/incident-externalTask-retry-action');

var ngModule = angular.module('cockpit.plugin.base.views', [
  camCommon.name,
  diagramInstancePlugins.name,
  diagramDefinitionPlugins.name
]);

ngModule.config(dashboardDeployments);
ngModule.config(dashboardReports);
ngModule.config(dashboardBatches);
ngModule.config(dashboardProcesses);
ngModule.config(dashboardDecisions);
ngModule.config(dashboardTasks);
ngModule.config(dashboardProcessDefinition);

ngModule.config(processDefinitions);

ngModule.config(processInstanceTable);
ngModule.config(calledProcessDefinitionTable);
// ngModule.config(updateSuspensionStateAction);
ngModule.config(editProcessDefinitionAction);
// ngModule.controller('UpdateProcessDefinitionSuspensionStateController', updateSuspensionStateDialog);
ngModule.controller('EditProcessDefinitionController', editProcessDefinitionDialog);
ngModule.config(pdIncidentsTab);
ngModule.config(saveProcessDefinitionAction);
ngModule.config(deployProcessDefinitionAction);
ngModule.controller('DeployProcessDefinitionController', deployProcessDefinitionDialog);
ngModule.config(deleteProcessDefinitionAction);
ngModule.controller('DeleteProcessDefinitionController', deleteProcessDefinitionDialog);

variableInstancesTab(ngModule);
ngModule.config(incidentsTab);
calledProcessInstanceTable(ngModule);
userTasksTable(ngModule);
jobRetryBulkAction(ngModule);
ngModule.controller('JobRetriesController', jobRetryBulkDialog);
ngModule.controller('JobRetryController', jobRetryDialog);
ngModule.controller('ExternalTaskRetryController', externalTaskRetryDialog);
cancelProcessInstanceAction(ngModule);
ngModule.controller('CancelProcessInstanceController', cancelProcessInstanceDialog);
ngModule.config(addVariableAction);
ngModule.config(updateSuspensionStateActionPI);
ngModule.controller('UpdateProcessInstanceSuspensionStateController', updateSuspensionStateDialogPI);
ngModule.config(incidentJobRetryAction);
ngModule.config(incidentExternalTaskRetryAction);

module.exports = ngModule;
