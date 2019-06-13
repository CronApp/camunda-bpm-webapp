package org.camunda.bpm.cockpit.impl.plugin.resources;

import org.camunda.bpm.engine.rest.impl.NamedProcessEngineRestServiceImpl;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

@Path(NamedProcessEngineRestServiceImpl.PATH)
public class ExtendedNamedProcessEngineRestServiceImpl extends NamedProcessEngineRestServiceImpl {

  @Path("/{name}" + CronProcessDefinitionRestService.PATH)
  public CronProcessDefinitionRestService getCreateProcessDefinitionResource(@PathParam("name") String engineName) {
    return new CronProcessDefinitionRestService(engineName);
  }
}
