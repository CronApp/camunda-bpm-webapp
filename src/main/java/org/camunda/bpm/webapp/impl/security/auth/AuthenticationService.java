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

import org.camunda.bpm.engine.AuthorizationService;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngineConfiguration;
import org.camunda.bpm.engine.identity.Group;
import org.camunda.bpm.engine.identity.Tenant;
import org.camunda.bpm.engine.identity.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.logging.Logger;

import static org.camunda.bpm.engine.authorization.Permissions.ACCESS;
import static org.camunda.bpm.engine.authorization.Resources.APPLICATION;

class AuthenticationService {

  private final static Logger LOGGER = Logger.getLogger(AuthenticationService.class.getName());

  private static final String[] APPS = new String[] { "cockpit", "tasklist", "admin"};
  private static final String APP_WELCOME = "welcome";

  Authentication createAuthenticate(ProcessEngine processEngine, String username, List<String> groupIds, List<String> tenantIds) {
    User user = processEngine.getIdentityService().createUserQuery().userId(username).singleResult();

    String userId = user.getId();
    // make sure authentication is executed without authentication :)
    processEngine.getIdentityService().clearAuthentication();

    if (groupIds == null) {
      groupIds = getGroupsOfUser(processEngine, userId);
    }

    if (tenantIds == null) {
      tenantIds = getTenantsOfUser(processEngine, userId);
    }

    // check user's app authorizations
    AuthorizationService authorizationService = processEngine.getAuthorizationService();

    HashSet<String> authorizedApps = new HashSet<>();
    authorizedApps.add(APP_WELCOME);

    ProcessEngineConfiguration processEngineConfiguration = processEngine.getProcessEngineConfiguration();

    if (processEngineConfiguration.isAuthorizationEnabled()) {
      for (String application: APPS) {
        if (isAuthorizedForApp(authorizationService, userId, groupIds, application)) {
          authorizedApps.add(application);
        }
      }
    } else {
      Collections.addAll(authorizedApps, APPS);
    }

    // create new authentication
    UserAuthentication newAuthentication = new UserAuthentication(userId, processEngine.getName());
    newAuthentication.setGroupIds(groupIds);
    newAuthentication.setTenantIds(tenantIds);
    newAuthentication.setAuthorizedApps(authorizedApps);

    return newAuthentication;
  }

  private List<String> getTenantsOfUser(ProcessEngine engine, String userId) {
    List<Tenant> tenants = engine.getIdentityService().createTenantQuery()
      .userMember(userId)
      .includingGroupsOfUser(true)
      .list();

    List<String> tenantIds = new ArrayList<>();
    for(Tenant tenant : tenants) {
      tenantIds.add(tenant.getId());
    }
    return tenantIds;
  }

  private List<String> getGroupsOfUser(ProcessEngine engine, String userId) {
    List<Group> groups = engine.getIdentityService().createGroupQuery()
      .groupMember(userId)
      .list();

    List<String> groupIds = new ArrayList<>();
    for (Group group : groups) {
      groupIds.add(group.getId());
    }
    return groupIds;
  }

  private boolean isAuthorizedForApp(AuthorizationService authorizationService, String username, List<String> groupIds, String application) {
    return authorizationService.isUserAuthorized(username, groupIds, ACCESS, APPLICATION, application);
  }

}
