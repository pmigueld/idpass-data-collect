import { createComponentDefinition } from '../utils/ComponentRegistry'
import type { ComponentSchema, ComponentSettingsDefinition } from '../types/ComponentDefinition'

// Import components
import BiometricCaptureBuilder from './BiometricCaptureBuilder.vue'
import BiometricCaptureRuntime from './BiometricCaptureRuntime.vue'

const fingerOptions = [
  { label: 'Left Thumb', value: 'Left_Thumb' },
  { label: 'Left Index Finger', value: 'Left_IndexFinger' },
  { label: 'Left Middle Finger', value: 'Left_MiddleFinger' },
  { label: 'Left Ring Finger', value: 'Left_RingFinger' },
  { label: 'Left Little Finger', value: 'Left_LittleFinger' },
  { label: 'Right Thumb', value: 'Right_Thumb' },
  { label: 'Right Index Finger', value: 'Right_IndexFinger' },
  { label: 'Right Middle Finger', value: 'Right_MiddleFinger' },
  { label: 'Right Ring Finger', value: 'Right_RingFinger' },
  { label: 'Right Little Finger', value: 'Right_LittleFinger' }
]

const environmentOptions = [
  { label: 'Developer', value: 'Developer' },
  { label: 'Staging', value: 'Staging' },
  { label: 'Production', value: 'Production' }
]

const purposeOptions = [
  { label: 'Auth', value: 'Auth' },
  { label: 'Registration', value: 'Registration' },
  { label: 'Verification', value: 'Verification' }
]

// Biometric Capture Component
export const biometricCaptureDefinition = createComponentDefinition({
  type: 'biometricCapture',
  label: 'Biometric Capture',
  group: 'advanced',
  icon: 'mdi-fingerprint',
  weight: 0,
  builder: BiometricCaptureBuilder,
  runtime: BiometricCaptureRuntime,
  schema: (): ComponentSchema => ({
    type: 'biometricCapture',
    key: '',
    label: 'Biometric Capture',
    inputType: 'hidden',
    protected: false,
    unique: false,
    persistent: true,
    intentAction: 'io.idpass.bca.finger.Capture',
    intentExtras: {},
    captureEnv: 'Developer',
    capturePurpose: 'Auth',
    captureSpecVersion: '0.9.5',
    captureTimeout: 30000,
    captureAutoCapture: true,
    captureQualityThreshold: 60,
    captureFingers: ['Right_Thumb'],
    captureDeviceId: '',
    captureTransactionPrefix: 'FORMIO',
    validate: {
      required: false
    }
  }),
  settings: (): ComponentSettingsDefinition[] => [
    {
      key: 'captureFingers',
      label: 'Fingers to Capture',
      type: 'select',
      multiple: true,
      options: fingerOptions,
      defaultValue: ['Right_Thumb'],
      required: true
    },
    {
      key: 'captureEnv',
      label: 'Environment',
      type: 'select',
      options: environmentOptions,
      defaultValue: 'Developer',
      tooltip: 'Value used in the MOSIP capture request (env).'
    },
    {
      key: 'capturePurpose',
      label: 'Purpose',
      type: 'select',
      options: purposeOptions,
      defaultValue: 'Auth',
      tooltip: 'Value used in the MOSIP capture request (purpose).'
    },
    {
      key: 'captureSpecVersion',
      label: 'Spec Version',
      type: 'text',
      defaultValue: '0.9.5',
      placeholder: '0.9.5'
    },
    {
      key: 'captureTimeout',
      label: 'Timeout (ms)',
      type: 'number',
      defaultValue: 30000,
      placeholder: '30000',
      min: 1000,
      max: 120000
    },
    {
      key: 'captureAutoCapture',
      label: 'Enable Auto Capture',
      type: 'boolean',
      defaultValue: true
    },
    {
      key: 'captureQualityThreshold',
      label: 'Quality Threshold',
      type: 'number',
      defaultValue: 60,
      placeholder: '60',
      min: 1,
      max: 100,
      tooltip: 'Minimum quality score required (1-100).'
    },
    {
      key: 'captureDeviceId',
      label: 'Preferred Device ID',
      type: 'text',
      placeholder: 'Optional device identifier'
    },
    {
      key: 'captureTransactionPrefix',
      label: 'Transaction Prefix',
      type: 'text',
      defaultValue: 'FORMIO',
      placeholder: 'FORMIO'
    },
    {
      key: 'intentAction',
      label: 'Android Intent Action',
      type: 'text',
      defaultValue: 'io.idpass.bca.finger.Capture',
      placeholder: 'io.idpass.bca.finger.Capture',
      tooltip: 'The Android Intent Action to launch.'
    },
    {
      key: 'intentExtras',
      label: 'Additional Intent Extras (JSON)',
      type: 'json',
      placeholder: '{"key": "value"}',
      tooltip: 'Optional JSON object merged into the generated extras sent to BCA.'
    }
  ]
})

export const biometricComponents = [
  biometricCaptureDefinition
]