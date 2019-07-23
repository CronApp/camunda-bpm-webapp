package org.camunda.bpm.cockpit.impl.plugin.base.dto;

import java.util.ArrayList;
import java.util.List;

public class BlocklyMethodDto {

  private String name;
  private String value;
  private List<BlocklyMethodParameterDto> parameters;

  public BlocklyMethodDto() {
  }

  public BlocklyMethodDto(final String name) {
    this.name = name;
    this.value = name;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  public List<BlocklyMethodParameterDto> getParameters() {
    if (parameters == null) {
      parameters = new ArrayList<>();
    }
    return parameters;
  }
}
