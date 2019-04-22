/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. Camunda licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var fs = require('fs');

var template = fs.readFileSync(__dirname + '/process-definitions.html', 'utf8');

module.exports = [ 'ViewsProvider', function(ViewsProvider) {
  console.log('modeler.processes.dashboard');
  ViewsProvider.registerDefaultView('modeler.processes.dashboard', {
    id: 'modeler-process-definition',
    label: 'Deployed Process Definitions',
    template: template,
    controller: [
      '$scope',
      'Views',
      'camAPI',
      'localConf',
      '$translate',
      function($scope, Views, camAPI, localConf, $translate) {

        var processDefinitionService = camAPI.resource('process-definition');

        $scope.headColumns = [
          { class: 'name', request: 'label', sortable: true, content: $translate.instant('PLUGIN_PROCESS_DEF_NAME')}
        ];

        // Default sorting
        var defaultValue = { sortBy: 'label', sortOrder: 'asc', sortReverse: false};

        $scope.sortObj   = loadLocal(defaultValue);

        // Update Table
        $scope.onSortChange = function(sortObj) {
          sortObj = sortObj || $scope.sortObj;
          // transforms sortOrder to boolean required by anqular-sorting;
          sortObj.sortReverse = sortObj.sortOrder !== 'asc';
          saveLocal(sortObj);
          $scope.sortObj = sortObj;
        };

        $scope.loadingState = 'LOADING';

        // get full list of process definitions and related resources
        var listProcessDefinitions =  function() {
          processDefinitionService.list({
            latest: true
          }, function(err, data) {

            // Add label for sorting
            data.items.forEach(function(item) {
              item.label = item.name || item.key;
            });

            $scope.processDefinitionData = data.items;
            $scope.processDefinitionsCount = data.count;

            $scope.loadingState = err? 'ERROR': 'LOADED';
          });
        };

        $scope.definitionVars = { read: [ 'pd' ] };

        var removeActionDeleteListener = $scope.$on('processes.action.delete', function(event, definitionId) {
          var definitions = $scope.processDefinitionData;

          for (var i = 0; i < definitions.length; i++) {
            if (definitions[i].id === definitionId) {
              definitions.splice(i, 1);
              break;
            }
          }

          $scope.processDefinitionsCount = definitions.length;
        });

        $scope.$on('$destroy', function() {
          removeActionDeleteListener();
        });

        listProcessDefinitions();

        function saveLocal(sortObj) {
          localConf.set('sortProcessDefTab', sortObj);
        }
        function loadLocal(defaultValue) {
          return localConf.get('sortProcessDefTab', defaultValue);
        }
      }],

    priority: 0
  });
}];
