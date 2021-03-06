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
package org.camunda.bpm.admin.impl.web;

import org.camunda.bpm.admin.Admin;
import org.camunda.bpm.admin.plugin.spi.AdminPlugin;
import org.camunda.bpm.webapp.impl.AbstractApplication;
import org.camunda.bpm.webapp.impl.security.auth.UserAuthenticationResource;

import java.util.List;
import java.util.Set;

/**
 * The rest api exposed by the admin application
 *
 * @author Daniel Meyer
 */
public class AdminApplication extends AbstractApplication {

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> classes = super.getClasses();

    classes.add(UserAuthenticationResource.class);
    classes.add(SetupResource.class);

    return classes;
  }


  protected void addPluginResourceClasses(Set<Class<?>> classes) {
    List<AdminPlugin> plugins = getPlugins();

    for (AdminPlugin plugin : plugins) {
      classes.addAll(plugin.getResourceClasses());
    }
  }

  private List<AdminPlugin> getPlugins() {
    return Admin.getRuntimeDelegate().getAppPluginRegistry().getPlugins();
  }

}
