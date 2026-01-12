import { Components } from '@formio/js'
import { BiometricCaptureComponent } from '@/components/formio/BiometricCaptureComponent'

export function registerFormioComponents() {
  // Register Biometric Capture component
  Components.setComponent('biometricCapture', BiometricCaptureComponent)
}
