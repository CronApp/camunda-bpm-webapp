package org.camunda.bpm.cockpit.impl.plugin.base.dto;

public class BlocklyMethodParameterDto {

  private String name;

  public BlocklyMethodParameterDto() {
  }

  public BlocklyMethodParameterDto(final String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
