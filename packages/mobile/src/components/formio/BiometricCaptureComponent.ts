import { Components } from '@formio/js'
import { createApp, h } from 'vue'
import BiometricCapture from './BiometricCapture.vue'

export class BiometricCaptureComponent extends Components.components.baseComponent {
  static schema() {
    return Components.components.baseComponent.schema({
      type: 'biometricCapture',
      label: 'Biometric Capture',
      key: 'biometricCapture',
      input: true,
      tableView: false,
      defaultValue: null,
      validate: {
        required: false
      },
      customOptions: {
        intentAction: 'io.idpass.bca.CAPTURE',
        intentPackage: 'io.idpass.bca',
        intentClass: 'io.idpass.bca.MainActivity',
        captureType: 'fingerprint',
        captureFormat: 'json'
      }
    })
  }

  static get builderInfo() {
    return {
      title: 'Biometric Capture',
      group: 'custom',
      icon: 'fa fa-fingerprint',
      weight: 0,
      schema: BiometricCaptureComponent.schema()
    }
  }

  get defaultSchema() {
    return BiometricCaptureComponent.schema()
  }

  attach(element: HTMLElement) {
    const superAttach = super.attach(element)
    const container = this.element

    if (container && !this.vueApp) {
      // Create Vue app instance for this component
      const componentInstance = this
      this.vueApp = createApp({
        render: () => h(BiometricCapture, {
          component: componentInstance.component,
          value: componentInstance.dataValue,
          readOnly: componentInstance.disabled,
          onInput: (value: unknown) => {
            componentInstance.setValue(value)
          }
        })
      })

      // Mount Vue component
      this.vueApp.mount(container)
    }

    return superAttach
  }

  detach() {
    if (this.vueApp) {
      // Unmount Vue component
      this.vueApp.unmount()
      this.vueApp = null
    }
    return super.detach()
  }

  getValue() {
    return this.dataValue
  }

  setValue(value: unknown) {
    this.dataValue = value
    this.updateValue(value, { modified: true })
  }
}
