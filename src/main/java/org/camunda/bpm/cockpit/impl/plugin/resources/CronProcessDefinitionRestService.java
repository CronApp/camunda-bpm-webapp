package org.camunda.bpm.cockpit.impl.plugin.resources;

import org.camunda.bpm.cockpit.impl.plugin.base.dto.DeploymentWithProcessDefinitionDto;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.Deployment;
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
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.camunda.bpm.engine.rest.impl.DeploymentRestServiceImpl.DEPLOYMENT_NAME;
import static org.camunda.bpm.engine.rest.impl.DeploymentRestServiceImpl.DEPLOYMENT_SOURCE;

public class CronProcessDefinitionRestService extends AbstractCockpitPluginResource {

  private final static Logger LOGGER = Logger.getLogger(CronProcessDefinitionRestService.class.getName());

  static final String PATH = "/cron-process-definition";

  private final static String DEPLOYMENT_ID = "deployment-id";
  private static final String VERSION_TAG = "version-tag";

  private static final String SNAPSHOT_VERSION = "snapshot";

  private static final Set<String> RESERVED_KEYWORDS = new HashSet<>();

  static {
    RESERVED_KEYWORDS.add(DEPLOYMENT_ID);
    RESERVED_KEYWORDS.add(DEPLOYMENT_NAME);
    RESERVED_KEYWORDS.add(DEPLOYMENT_SOURCE);
    RESERVED_KEYWORDS.add(VERSION_TAG);
  }

  CronProcessDefinitionRestService(String engineName) {
    super(engineName);
  }

  @GET
  @Path("/new")
  @Produces(MediaType.APPLICATION_JSON)
  public ProcessDefinitionDiagramDto getEmptyProcessDefinitionBpmn20Xml() {
    BpmnModelInstance modelInstance = Bpmn.createExecutableProcess().camundaVersionTag(SNAPSHOT_VERSION).done();

    String id = getProcessId(modelInstance);
    String bpmn20Xml = Bpmn.convertToString(modelInstance);

    return ProcessDefinitionDiagramDto.create(id, bpmn20Xml);
  }

  @POST
  @Path("/save")
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public DeploymentWithProcessDefinitionDto saveProcessDefinition(MultipartFormData payload) {
    DeploymentBuilder deploymentBuilder = extractDeploymentInformation(payload);

    if (deploymentBuilder.getResourceNames().isEmpty()) {
      throw new InvalidRequestException(Response.Status.BAD_REQUEST, "No deployment resources contained in the form upload.");
    }

    String deploymentId = extractDeploymentId(payload);
    String versionTag = extractVersionTag(payload);

    if (deploymentId != null && !deploymentId.isEmpty() && SNAPSHOT_VERSION.equals(versionTag)) {
      deleteDeployment(deploymentId);
    }

    DeploymentWithDefinitions deploymentWithDefinitions = deploymentBuilder.deployWithResult();

    DeploymentWithProcessDefinitionDto deployment = DeploymentWithProcessDefinitionDto.fromDeployment(deploymentWithDefinitions);

    updateSuspensionState(deployment.getDeployedProcessDefinition().getId());

    return deployment;
  }

  @POST
  @Path("/deploy")
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public DeploymentWithDefinitionsDto createDeployment(MultipartFormData payload) {
    DeploymentBuilder deploymentBuilder = extractDeploymentInformation(payload);

    if (deploymentBuilder.getResourceNames().isEmpty()) {
      throw new InvalidRequestException(Response.Status.BAD_REQUEST, "No deployment resources contained in the form upload.");
    }

    String deploymentId = extractDeploymentId(payload);
    String versionTag = extractVersionTag(payload);

    if (deploymentId != null && !deploymentId.isEmpty() && SNAPSHOT_VERSION.equals(versionTag)) {
      deleteDeployment(deploymentId);
    }

    DeploymentWithDefinitions deployment = deploymentBuilder.deployWithResult();

    return DeploymentWithDefinitionsDto.fromDeployment(deployment);
  }

  private void updateSuspensionState(final String processDefinitionId) {
    ProcessDefinitionSuspensionStateDto dto = new ProcessDefinitionSuspensionStateDto();
    dto.setSuspended(true);
    dto.setIncludeProcessInstances(true);
    dto.setProcessDefinitionId(processDefinitionId);

    try {
      dto.updateSuspensionState(getProcessEngine());
    } catch (IllegalArgumentException e) {
      String message = String.format("Não foi possível atualizar o estado de suspensão das definições de processo devido a: %s", e.getMessage()) ;
      throw new InvalidRequestException(Response.Status.BAD_REQUEST, e, message);
    }
  }

  private String extractDeploymentId(MultipartFormData payload) {
    MultipartFormData.FormPart processDefinitionId = payload.getNamedPart(DEPLOYMENT_ID);
    return processDefinitionId == null ? null : processDefinitionId.getTextContent();
  }

  private String extractVersionTag(MultipartFormData payload) {
    MultipartFormData.FormPart versionTag = payload.getNamedPart(VERSION_TAG);
    return versionTag == null ? null : versionTag.getTextContent();
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

  private void deleteDeployment(String deploymentId) {
    RepositoryService repositoryService = getProcessEngine().getRepositoryService();
    Deployment deployment = repositoryService.createDeploymentQuery().deploymentId(deploymentId).singleResult();

    if (deployment == null) {
      LOGGER.log(Level.WARNING, "Deployment with id '" + deploymentId + "' do not exist");
    }

    repositoryService.deleteDeployment(deploymentId, true, true, true);
  }
}
