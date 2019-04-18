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

module.exports = function(config, watchConf) {
  'use strict';

  var options = {
    livereload: false
  };


  watchConf.modeler_assets = {
    options: options,
    files: [
      '<%= pkg.gruntConfig.modelerSourceDir %>/{fonts,images}/**/*',
      '<%= pkg.gruntConfig.modelerSourceDir %>/scripts/index.html',
      '<%= pkg.gruntConfig.modelerSourceDir %>/scripts/favicon.ico'
    ],
    tasks: [
      'copy:modeler_assets',
      'copy:modeler_index'
    ]
  };

  watchConf.modeler_styles = {
    options: options,
    files: [
      '<%= pkg.gruntConfig.modelerSourceDir %>/styles/**/*.{css,less}',
      '<%= pkg.gruntConfig.modelerSourceDir %>/scripts/**/*.{css,less}'
    ],
    tasks: [
      'less:modeler_styles'
    ]
  };

  watchConf.modeler_plugin_styles = {
    options: options,
    files: [
      '<%= pkg.gruntConfig.pluginSourceDir %>/modeler/plugins/**/*.{css,less}'
    ],
    tasks: [
      'less:modeler_plugin_styles'
    ]
  };

  watchConf.modeler_scripts_lint = {
    options: options,
    files: [
      '<%= pkg.gruntConfig.modelerSourceDir %>/scripts/**/*.js'
    ],
    tasks: [
      'newer:eslint:modeler_scripts'
    ]
  };

  watchConf.modeler_plugins_lint = {
    options: options,
    files: [
      '<%= pkg.gruntConfig.pluginSourceDir %>/modeler/plugins/**/*.js'
    ],
    tasks: [
      'newer:eslint:modeler_plugins'
    ]
  };


  watchConf.modeler_dist = {
    options: {
      livereload: config.livereloadPort || false
    },
    files: [
      '<%= pkg.gruntConfig.modelerBuildTarget %>/**/*.{css,html,js}',
      '<%= pkg.gruntConfig.pluginBuildTarget %>/modeler/**/*.{css,html,js}'
    ]
  };
};
