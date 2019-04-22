/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. Camunda licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
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
package org.camunda.bpm.modeler;

/**
 * The modeler application. Provides access to the modeler core services.
 *
 * @author Roque Santos
 *
 */
public class Modeler {

  /**
   * The {@link ModelerRuntimeDelegate} is an delegate that will be
   * initialized by bootstrapping camunda welcome with an specific
   * instance
   */
  protected static ModelerRuntimeDelegate MODELER_RUNTIME_DELEGATE;

  /**
   * Returns an instance of {@link ModelerRuntimeDelegate}
   *
   * @return
   */
  public static ModelerRuntimeDelegate getRuntimeDelegate() {
    return MODELER_RUNTIME_DELEGATE;
  }

  /**
   * A setter to set the {@link ModelerRuntimeDelegate}.
   * @param modelerRuntimeDelegate
   */
  public static void setRuntimeDelegate(ModelerRuntimeDelegate modelerRuntimeDelegate) {
    MODELER_RUNTIME_DELEGATE = modelerRuntimeDelegate;
  }
}
