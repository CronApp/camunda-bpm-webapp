/*
 * Copyright © 2014 - 2018 camunda services GmbH and various authors (info@camunda.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
package org.camunda.bpm.cockpit.impl.plugin.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginRootResource;
import org.camunda.bpm.engine.rest.util.ProvidersUtil;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.ext.Providers;

/**
 *
 * @author nico.rehwaldt
 */
@Path("plugin/base")
public class BaseRootResource extends AbstractCockpitPluginRootResource {
  @Context
  protected Providers providers;

  public BaseRootResource() {
    super("base");
  }

  @Path("{engine}" + ProcessDefinitionRestService.PATH)
  public ProcessDefinitionRestService getProcessDefinitionResource(@PathParam("engine") String engineName) {
    return subResource(new ProcessDefinitionRestService(engineName));
  }

  @Path("{engine}" + ProcessInstanceRestService.PATH)
  public ProcessInstanceRestService getProcessInstanceRestService(@PathParam("engine") String engineName) {
    ProcessInstanceRestService subResource = new ProcessInstanceRestService(engineName);
    subResource.setObjectMapper(getObjectMapper());
    return subResource(subResource);
  }

  @Path("{engine}" + IncidentRestService.PATH)
  public IncidentRestService getIncidentRestService(@PathParam("engine") String engineName) {
    return subResource(new IncidentRestService(engineName));
  }

  @Path("{engine}" + CreateProcessDefinitionRestService.PATH)
  public CreateProcessDefinitionRestService getCreateProcessDefinitionResource(@PathParam("engine") String engineName) {
    return subResource(new CreateProcessDefinitionRestService(engineName));
  }

  private ObjectMapper getObjectMapper() {
    if (providers == null) {
      return null;
    }
    return ProvidersUtil
      .resolveFromContext(providers, ObjectMapper.class, MediaType.APPLICATION_JSON_TYPE, this.getClass());
  }

}
