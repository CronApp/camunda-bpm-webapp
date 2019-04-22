package org.camunda.bpm.webapp.impl;

import com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider;
import org.camunda.bpm.engine.rest.exception.ExceptionHandler;
import org.camunda.bpm.engine.rest.exception.RestExceptionHandler;
import org.camunda.bpm.engine.rest.mapper.JacksonConfigurator;

import javax.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;

public abstract class AbstractApplication extends Application {

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> classes = new HashSet<>();

    classes.add(JacksonConfigurator.class);
    classes.add(JacksonJsonProvider.class);
    classes.add(ExceptionHandler.class);
    classes.add(RestExceptionHandler.class);

    addPluginResourceClasses(classes);

    return classes;
  }

  protected abstract void addPluginResourceClasses(Set<Class<?>> classes);
}
