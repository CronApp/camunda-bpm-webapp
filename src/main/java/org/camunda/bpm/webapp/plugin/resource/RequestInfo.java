/*
 * Copyright © 2014 - 2018 camunda services GmbH and various authors (info@camunda.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.camunda.bpm.webapp.plugin.resource;

import javax.servlet.ServletContext;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.UriInfo;

/**
 * @author Daniel Meyer
 *
 */
public class RequestInfo {

  private HttpHeaders headers;
  private ServletContext servletContext;
  private UriInfo uriInfo;

  RequestInfo(HttpHeaders headers, ServletContext servletContext, UriInfo uriInfo) {
    this.headers = headers;
    this.servletContext = servletContext;
    this.uriInfo = uriInfo;
  }

  public HttpHeaders getHeaders() {
    return headers;
  }

  public ServletContext getServletContext() {
    return servletContext;
  }

  public UriInfo getUriInfo() {
    return uriInfo;
  }


}
