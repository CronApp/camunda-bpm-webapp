package org.camunda.bpm.cockpit.impl.plugin.base.dto;

import java.util.ArrayList;
import java.util.List;

public class BlocklyInfoDto {

  private String name;
  private String value;
  private List<BlocklyMethodDto> methods;

  public BlocklyInfoDto() {
  }

  public BlocklyInfoDto(final String name) {
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

  public List<BlocklyMethodDto> getMethods() {
    if (methods == null) {
      methods = new ArrayList<>();
    }
    return methods;
  }
}
