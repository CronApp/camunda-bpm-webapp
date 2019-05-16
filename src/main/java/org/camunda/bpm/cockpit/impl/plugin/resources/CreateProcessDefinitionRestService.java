package org.camunda.bpm.cockpit.impl.plugin.resources;

import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDiagramDto;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.Process;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Iterator;

public class CreateProcessDefinitionRestService extends AbstractCockpitPluginResource {

  static final String PATH = "/create-process-definition";

  CreateProcessDefinitionRestService(String engineName) {
    super(engineName);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public ProcessDefinitionDiagramDto getEmptyProcessDefinitionBpmn20Xml() {
    BpmnModelInstance modelInstance = Bpmn.createProcess().done();

    String id = getProcessId(modelInstance);
    String bpmn20Xml = Bpmn.convertToString(modelInstance);

    return ProcessDefinitionDiagramDto.create(id, bpmn20Xml);
  }

  private String getProcessId(BpmnModelInstance modelInstance) {
    final Iterator<Process> processes = modelInstance.getDefinitions()
      .getChildElementsByType(Process.class)
      .iterator();

    if (!processes.hasNext()) {
      return null;
    }

    return processes.next().getId();
  }
}
