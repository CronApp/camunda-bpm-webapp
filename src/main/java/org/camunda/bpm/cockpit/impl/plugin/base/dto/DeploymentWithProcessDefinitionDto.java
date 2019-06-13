package org.camunda.bpm.cockpit.impl.plugin.base.dto;

import org.camunda.bpm.engine.repository.DeploymentWithDefinitions;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.rest.dto.repository.DeploymentDto;
import org.camunda.bpm.engine.rest.dto.repository.ProcessDefinitionDto;

import java.util.List;

public class DeploymentWithProcessDefinitionDto extends DeploymentDto {

  private ProcessDefinitionDto deployedProcessDefinition;

  public ProcessDefinitionDto getDeployedProcessDefinition() {
    return deployedProcessDefinition;
  }

  public static DeploymentWithProcessDefinitionDto fromDeployment(DeploymentWithDefinitions deployment) {
    DeploymentWithProcessDefinitionDto dto = new DeploymentWithProcessDefinitionDto();
    dto.id = deployment.getId();
    dto.name = deployment.getName();
    dto.source = deployment.getSource();
    dto.deploymentTime = deployment.getDeploymentTime();

    initDeployedResource(deployment, dto);

    return dto;
  }

  private static void initDeployedResource(DeploymentWithDefinitions deployment, DeploymentWithProcessDefinitionDto dto) {
    List<ProcessDefinition> deployedProcessDefinitions = deployment.getDeployedProcessDefinitions();
    if (deployedProcessDefinitions != null && deployedProcessDefinitions.size() > 0) {
      dto.deployedProcessDefinition = ProcessDefinitionDto.fromProcessDefinition(deployedProcessDefinitions.get(0));
    }
  }
}
