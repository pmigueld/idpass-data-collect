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

import { describe, expect, it, afterEach, vi } from 'vitest'
import { createApp, type App } from 'vue'
import { Formio } from '@formio/js'
import FormioWrapper from '@/components/FormioWrapper.vue'
import { registerCustomComponents } from '../index'

const schema = {
  display: 'form',
  components: [
    { type: 'biometricCapture', key: 'bio', label: 'Biometrics', input: true },
    { type: 'claim169Scanner', key: 'scan', label: 'Identity', input: true },
    { type: 'checkbox', key: 'agree', label: 'Agree', input: true },
  ],
}

describe('custom Form.io components on the v5 registry', () => {
  const cleanups: Array<() => void> = []

  afterEach(() => {
    while (cleanups.length) cleanups.pop()?.()
  })

  it('registers biometricCapture and claim169Scanner on @formio/js', async () => {
    await registerCustomComponents()
    const components = (Formio as unknown as { Components: { components: Record<string, unknown> } }).Components
      .components
    expect(components.biometricCapture).toBeTruthy()
    expect(components.claim169Scanner).toBeTruthy()
  })

  it('renders the custom components and Bootstrap 5 checkbox markup', async () => {
    await registerCustomComponents()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const form = await Formio.createForm(el, schema)
    cleanups.push(() => {
      void form.destroy?.()
      el.remove()
    })

    expect(form.getComponent('bio')).toBeTruthy()
    expect(form.getComponent('scan')).toBeTruthy()
    expect(el.querySelector('.biometric-capture-container')).toBeTruthy()
    expect(el.querySelector('.claim169-scanner')).toBeTruthy()
    expect(el.querySelector('.claim169-scanner__btn')?.textContent).toContain('Scan')
    expect(el.querySelector('.form-check')).toBeTruthy()
    expect(el.querySelector('.custom-control, .input-group-append, .custom-select')).toBeNull()
  }, 20000)

  it('renders those components through @formio/vue', async () => {
    await registerCustomComponents()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const app: App = createApp(FormioWrapper, { form: schema })
    app.mount(el)
    cleanups.push(() => {
      app.unmount()
      el.remove()
    })

    await vi.waitFor(() => {
      expect(el.querySelector('.biometric-capture-container')).toBeTruthy()
    })
    expect(el.querySelector('.claim169-scanner')).toBeTruthy()
    expect(el.querySelector('.form-check')).toBeTruthy()
    expect(el.querySelector('.custom-control')).toBeNull()
  }, 20000)
})
