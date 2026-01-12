import { registerPlugin } from '@capacitor/core'

export interface BiometricCaptureOptions {
  intentAction: string
  intentPackage: string
  intentClass: string
  captureType: string
  captureFormat: string
}

export interface CaptureResponse {
  captureResponse: Record<string, unknown>
  fingerprintImages?: string[]
  timestamp?: string
  success: boolean
}

export interface BiometricCapturePlugin {
  capture(options: { options: BiometricCaptureOptions }): Promise<CaptureResponse>
}

const BiometricCapturePlugin = registerPlugin<BiometricCapturePlugin>('BiometricCapture', {
  web: () => import('./biometric-capture.web').then((m) => new m.BiometricCaptureWeb()),
})

export { BiometricCapturePlugin }
