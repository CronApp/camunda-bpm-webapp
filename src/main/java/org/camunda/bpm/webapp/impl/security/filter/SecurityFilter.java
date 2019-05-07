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
package org.camunda.bpm.webapp.impl.security.filter;

import org.camunda.bpm.engine.impl.util.IoUtil;
import org.camunda.bpm.webapp.impl.security.filter.util.FilterRules;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>Simple filter implementation which delegates to a list of {@link SecurityFilterRule FilterRules},
 * evaluating their condition for the given request.</p>
 *
 * <p>This filter must be configured using a init-param in the web.xml file. The parameter must be named
 * "configFile" and point to the configuration file located in the servlet context.</p>
 *
 * @author Daniel Meyer
 * @author nico.rehwaldt
 */
public class SecurityFilter implements Filter {

  private List<SecurityFilterRule> filterRules = new ArrayList<>();

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    doFilterSecure((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  private void doFilterSecure(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
    String requestUri = getRequestUri(request);

    Authorization authorization = authorize(request.getMethod(), requestUri, filterRules);

    // attach authorization headers to response
    authorization.attachHeaders(response);

    if (authorization.isGranted()) {
      // if request is authorized
      chain.doFilter(request, response);
    } else if (authorization.isAuthenticated()) {
      String application = authorization.getApplication();

      if (application != null) {
        sendForbiddenApplicationAccess(application, response);
      } else {
        sendForbidden(response);
      }
    } else {
      sendUnauthorized(response);
    }
  }

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    loadFilterRules(filterConfig);
  }

  @Override
  public void destroy() {
  }

  /**
   * Iterate over a number of filter rules and match them against
   * the specified request.
   *
   * @param requestMethod
   * @param requestUri
   * @param filterRules
   *
   * @return the joined {@link Authorization} for this request matched against all filter rules
   */
  public static Authorization authorize(String requestMethod, String requestUri, List<SecurityFilterRule> filterRules) {
    return FilterRules.authorize(requestMethod, requestUri, filterRules);
  }

  private void loadFilterRules(FilterConfig filterConfig) throws ServletException {
    String configFileName = filterConfig.getInitParameter("configFile");

    InputStream configFileResource = filterConfig.getServletContext().getResourceAsStream(configFileName);

    if (configFileResource == null) {
      throw new ServletException("Could not read security filter config file '" + configFileName + "': no such resource in servlet context.");
    }

    try {
      filterRules = FilterRules.load(configFileResource);
    } catch (Exception e) {
      throw new RuntimeException("Exception while parsing '" + configFileName + "'", e);
    } finally {
      IoUtil.closeSilently(configFileResource);
    }
  }

  private void sendForbidden(HttpServletResponse response) throws IOException {
    response.sendError(403);
  }

  private void sendUnauthorized(HttpServletResponse response) throws IOException {
    response.sendError(401);
  }

  private void sendForbiddenApplicationAccess(String application, HttpServletResponse response) throws IOException {
    response.sendError(403, "No access rights for " + application);
  }

  private String getRequestUri(HttpServletRequest request) {
    String contextPath = request.getContextPath();
    return request.getRequestURI().substring(contextPath.length());
  }
}
