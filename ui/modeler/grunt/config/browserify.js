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

module.exports = function(config, browserifyConfig) {
  'use strict';

  browserifyConfig.modeler_scripts = {
    options: {
      browserifyOptions: {
        standalone: 'CamundaModelerUi',
        debug: true
      },
      watch: true,
      transform: [ 'brfs' ],
      postBundleCB: function(err, src, next) {

        console.log('post bundling', err);

        var buildMode = config.grunt.config('buildMode');
        var livereloadPort = config.grunt.config('pkg.gruntConfig.livereloadPort');
        if (buildMode !== 'prod' && livereloadPort) {
          config.grunt.log.writeln('Enabling livereload for modeler on port: ' + livereloadPort);
          //var contents = grunt.file.read(data.path);
          var contents = src.toString();

          contents = contents
            .replace(/\/\* live-reload/, '/* live-reload */')
            .replace(/LIVERELOAD_PORT/g, livereloadPort);

          next(err, new Buffer(contents));
        } else {
          next(err, src);
        }

      }
    },
    src: ['./<%= pkg.gruntConfig.modelerSourceDir %>/scripts/camunda-modeler-ui.js'],
    dest: '<%= pkg.gruntConfig.modelerBuildTarget %>/scripts/camunda-modeler-ui.js'
  };

  browserifyConfig.modeler_plugins = {
    options: {
      watch: true,
      transform: [ 'brfs',
        [ 'exposify',
          {
            expose: {
              'angular': 'angular',
              'jquery': 'jquery',
              'camunda-commons-ui': 'camunda-commons-ui',
              'camunda-bpm-sdk-js': 'camunda-bpm-sdk-js',
              'angular-data-depend': 'angular-data-depend',
              'moment': 'moment',
              'events': 'events',
              'cam-common': 'cam-common',
              'lodash': 'lodash'
            }
          }
        ]
      ],
      browserifyOptions: {
        standalone: 'ModelerPlugins',
        debug: true
      }
    },
    src: ['./<%= pkg.gruntConfig.pluginSourceDir %>/modeler/plugins/modelerPlugins.js'],
    dest: '<%= pkg.gruntConfig.pluginBuildTarget %>/modeler/app/plugin.js'
  };
};
