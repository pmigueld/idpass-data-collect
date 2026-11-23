/*
 * Licensed to the Association pour la cooperation numerique (ACN) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ACN licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FormRenderer from '../FormRenderer.vue'

describe('FormRenderer', () => {
  it('renders a form with Bootstrap 5 markup through @formio/js', async () => {
    // inputmask (via @formio/js) calls matchMedia while it evaluates.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })

    const wrapper = mount(FormRenderer, {
      props: {
        schema: {
          components: [
            { type: 'textfield', key: 'givenName', label: 'Given name', input: true },
            { type: 'checkbox', key: 'agree', label: 'Agree', input: true },
          ],
        },
      },
      global: {
        stubs: {
          'v-alert': { template: '<div class="v-alert-stub"><slot /></div>' },
          'v-progress-linear': true,
        },
      },
    })

    await vi.waitFor(() => {
      expect(wrapper.find('.form-check').exists()).toBe(true)
    })
    expect(wrapper.find('.custom-control, .input-group-append').exists()).toBe(false)
    expect(wrapper.find('input[name="data[givenName]"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Submit')
    expect(wrapper.find('.v-alert-stub').exists()).toBe(false)
  }, 20000)
})
