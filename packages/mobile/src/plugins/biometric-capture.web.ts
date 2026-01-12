import { WebPlugin } from '@capacitor/core'
import type { BiometricCapturePlugin, BiometricCaptureOptions, CaptureResponse } from './biometric-capture'

export class BiometricCaptureWeb extends WebPlugin implements BiometricCapturePlugin {
  async capture(_options: BiometricCaptureOptions): Promise<CaptureResponse> {
    // Web fallback/mock for development
    console.warn('BiometricCapture: Web platform not supported. This is a mobile-only feature.')
    
    // Return mock data for testing in browser
    return {
      captureResponse: {
        status: 'mock',
        message: 'Web platform - biometric capture not available',
        captureType: _options.captureType
      },
      fingerprintImages: [],
      timestamp: new Date().toISOString(),
      success: false
    }
  }
}
