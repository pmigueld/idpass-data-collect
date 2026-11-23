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

import { describe, expect, it } from 'vitest'
import { Formio } from '@formio/js'
import { registerBuilderComponents } from '../builderComponents'

describe('Form.io Bootstrap 5 templates', () => {
  it('renders checks with Bootstrap 5 markup and keeps custom builder components', async () => {
    registerBuilderComponents()
    const el = document.createElement('div')
    document.body.appendChild(el)
    try {
      const form = await Formio.createForm(el, {
        components: [
          { type: 'checkbox', key: 'agree', label: 'Agree', input: true },
          { type: 'textfield', key: 'givenName', label: 'Given name', input: true },
          { type: 'biometricCapture', key: 'bio', label: 'Biometrics', input: true },
        ],
      })
      expect(el.querySelector('.form-check')).toBeTruthy()
      expect(el.querySelector('.form-control')).toBeTruthy()
      expect(el.querySelector('.custom-control, .custom-select, .input-group-append')).toBeNull()
      expect(form.getComponent('bio')).toBeTruthy()
      expect(form.getComponent('bio').component.type).toBe('biometricCapture')
      await form.destroy?.()
    } finally {
      el.remove()
    }
  }, 20000)
})
