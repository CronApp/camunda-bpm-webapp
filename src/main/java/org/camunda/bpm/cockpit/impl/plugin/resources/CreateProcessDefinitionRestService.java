package org.camunda.bpm.cockpit.impl.plugin.resources;

import org.camunda.bpm.cockpit.impl.plugin.base.sub.resources.CreateProcessDefinitionResource;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;

public class CreateProcessDefinitionRestService extends AbstractCockpitPluginResource {

  static final String PATH = "/create-process-definition";

  CreateProcessDefinitionRestService(String engineName) {
    super(engineName);
  }

  public CreateProcessDefinitionResource getCreateProcessDefinition() {
    return new CreateProcessDefinitionResource(getProcessEngine().getName());
  }
}
