package org.camunda.bpm.cockpit.impl.plugin.resources;

import org.camunda.bpm.cockpit.impl.plugin.base.dto.DeploymentWithProcessDefinitionDto;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.repository.DeploymentBuilder;
import org.camunda.bpm.engine.repository.DeploymentWithDefinitions;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentWithDefinitionsDto;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDiagramDto;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionSuspensionStateDto;
import org.camunda.bpm.engine.rest.exception.InvalidRequestException;
import org.camunda.bpm.engine.rest.mapper.MultipartFormData;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.Process;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.ByteArrayInputStream;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import static org.camunda.bpm.engine.rest.impl.DeploymentRestServiceImpl.*;

public class CronProcessDefinitionRestService extends AbstractCockpitPluginResource {

  static final String PATH = "/cron-process-definition";

  private static final Set<String> RESERVED_KEYWORDS = new HashSet<>();

  static {
    RESERVED_KEYWORDS.add(DEPLOYMENT_NAME);
    RESERVED_KEYWORDS.add(DEPLOYMENT_SOURCE);
  }

  CronProcessDefinitionRestService(String engineName) {
    super(engineName);
  }

  @GET
  @Path("/new")
  @Produces(MediaType.APPLICATION_JSON)
  public ProcessDefinitionDiagramDto getEmptyProcessDefinitionBpmn20Xml() {
    BpmnModelInstance modelInstance = Bpmn.createExecutableProcess().done();

    String id = getProcessId(modelInstance);
    String bpmn20Xml = Bpmn.convertToString(modelInstance);

    return ProcessDefinitionDiagramDto.create(id, bpmn20Xml);
  }

  @POST
  @Path("/save")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @Produces(MediaType.APPLICATION_JSON)
  public DeploymentWithProcessDefinitionDto saveProcessDefinition(MultipartFormData payload) {
    DeploymentBuilder deploymentBuilder = extractDeploymentInformation(payload);

    if (deploymentBuilder.getResourceNames().isEmpty()) {
      throw new InvalidRequestException(Response.Status.BAD_REQUEST, "No deployment resources contained in the form upload.");
    }

    DeploymentWithDefinitions deploymentWithDefinitions = deploymentBuilder.deployWithResult();

    DeploymentWithProcessDefinitionDto deployment = DeploymentWithProcessDefinitionDto.fromDeployment(deploymentWithDefinitions);

    updateSuspensionState(deployment.getDeployedProcessDefinition().getId());

    return deployment;
  }

  private void updateSuspensionState(final String processDefinitionId) {
    ProcessDefinitionSuspensionStateDto dto = new ProcessDefinitionSuspensionStateDto();
    dto.setSuspended(true);
    dto.setIncludeProcessInstances(true);
    dto.setProcessDefinitionId(processDefinitionId);

    try {
      dto.updateSuspensionState(getProcessEngine());
    } catch (IllegalArgumentException e) {
      String message = String.format("Could not update the suspension state of Process Definitions due to: %s", e.getMessage()) ;
      throw new InvalidRequestException(Response.Status.BAD_REQUEST, e, message);
    }
  }

  private DeploymentBuilder extractDeploymentInformation(MultipartFormData payload) {
    DeploymentBuilder deploymentBuilder = getProcessEngine().getRepositoryService().createDeployment();

    Set<String> partNames = payload.getPartNames();

    for (String name : partNames) {
      MultipartFormData.FormPart part = payload.getNamedPart(name);

      if (!RESERVED_KEYWORDS.contains(name)) {
        deploymentBuilder.addInputStream(part.getFileName(), new ByteArrayInputStream(part.getBinaryContent()));
      }
    }

    MultipartFormData.FormPart deploymentName = payload.getNamedPart(DEPLOYMENT_NAME);
    if (deploymentName != null) {
      deploymentBuilder.name(deploymentName.getTextContent());
    }

    MultipartFormData.FormPart deploymentSource = payload.getNamedPart(DEPLOYMENT_SOURCE);
    if (deploymentSource != null) {
      deploymentBuilder.source(deploymentSource.getTextContent());
    }

    return deploymentBuilder;
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
