package org.camunda.bpm.cockpit.impl.plugin.base.sub.resources;

import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

public class CreateProcessDefinitionResource extends AbstractCockpitPluginResource {

  public CreateProcessDefinitionResource(String engineName) {
    super(engineName);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public String createProcessDefinition() {
    BpmnModelInstance modelInstance = Bpmn.createProcess().done();

    return Bpmn.convertToString(modelInstance);
  }
}
