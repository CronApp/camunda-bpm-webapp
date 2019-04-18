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
package org.camunda.bpm.tasklist.impl.web;

import org.camunda.bpm.tasklist.Tasklist;
import org.camunda.bpm.tasklist.plugin.spi.TasklistPlugin;
import org.camunda.bpm.webapp.impl.AbstractApplication;

import java.util.List;
import java.util.Set;

/**
 * @author Roman Smirnov
 */
public class TasklistApplication extends AbstractApplication {

  protected void addPluginResourceClasses(Set<Class<?>> classes) {
    List<TasklistPlugin> plugins = getTasklistPlugins();

    for (TasklistPlugin plugin : plugins) {
      classes.addAll(plugin.getResourceClasses());
    }
  }

  private List<TasklistPlugin> getTasklistPlugins() {
    return Tasklist.getRuntimeDelegate().getAppPluginRegistry().getPlugins();
  }

}
