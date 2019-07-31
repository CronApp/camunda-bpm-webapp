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
package org.camunda.bpm.webapp.impl.security.auth;

import org.camunda.bpm.webapp.impl.security.SecurityActions;
import org.camunda.bpm.webapp.impl.security.SecurityActions.SecurityAction;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;


/**
 * <p>Servlet {@link Filter} implementation responsible for populating the
 * {@link Authentications#getCurrent()} thread-local (ie. binding the current
 * set of authentications to the current thread so that it may easily be obtained
 * by application parts not having access to the current session.</p>
 *
 * @author Daniel Meyer
 * @author nico.rehwaldt
 */
public class AuthenticationFilter implements Filter {

  public void init(FilterConfig filterConfig) {
  }

  public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
    final HttpServletRequest req = (HttpServletRequest) request;

    // get authentication from session
    Authentications authentications = Authentications.getFromSession(req.getSession());
    Authentications.setCurrent(authentications);

    try {
      SecurityActions.runWithAuthentications((SecurityAction<Void>) () -> {
        chain.doFilter(request, response);
        return null;
      }, authentications);
    } finally {
      Authentications.clearCurrent();
      Authentications.updateSession(req.getSession(), authentications);
    }
  }

  public void destroy() {
  }
}
