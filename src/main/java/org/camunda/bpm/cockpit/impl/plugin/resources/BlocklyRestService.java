package org.camunda.bpm.cockpit.impl.plugin.resources;

import org.camunda.bpm.cockpit.impl.plugin.base.dto.BlocklyInfoDto;
import org.camunda.bpm.cockpit.impl.plugin.base.dto.BlocklyMethodDto;
import org.camunda.bpm.cockpit.impl.plugin.base.dto.BlocklyMethodParameterDto;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.reflections.Reflections;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class BlocklyRestService extends AbstractCockpitPluginResource {

  private static final String PREFIX = "blockly";

  final static String PATH = "/blockly";

  BlocklyRestService(String engineName) {
    super(engineName);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public List<BlocklyInfoDto> getBlocklyInfos() {
    return loadBlocklyInfos();
  }

  private List<BlocklyInfoDto> loadBlocklyInfos() {
    Reflections reflections = new Reflections(PREFIX);

    Set<Class<?>> types = reflections.getTypesAnnotatedWith(Component.class);

    if (CollectionUtils.isEmpty(types)) {
      return Collections.emptyList();
    }

    return transformBlockly(types);
  }

  private List<BlocklyInfoDto> transformBlockly(final Set<Class<?>> types) {
    return types.stream().map(type -> {
      BlocklyInfoDto blocklyInfoDto = new BlocklyInfoDto(type.getSimpleName());
      blocklyInfoDto.getMethods().addAll(transformMethods(type.getDeclaredMethods()));
      return blocklyInfoDto;
    }).collect(Collectors.toList());
  }

  private List<BlocklyMethodDto> transformMethods(final Method[] methods) {
    return Stream.of(methods).map(method -> {
      BlocklyMethodDto blocklyMethodDto = new BlocklyMethodDto(method.getName());
      blocklyMethodDto.getParameters().addAll(transformParameters(method.getParameters()));
      return blocklyMethodDto;
    }).collect(Collectors.toList());
  }

  private List<BlocklyMethodParameterDto> transformParameters(final Parameter[] parameters) {
    return Stream.of(parameters)
      .map(parameter -> new BlocklyMethodParameterDto(parameter.getName()))
      .collect(Collectors.toList());
  }
}
