# Biometric Capture Component - Mobile Runtime

This document describes how the Biometric Capture component works in the mobile app runtime.

## Overview

The Biometric Capture component is a custom Form.io component that integrates with the ID PASS Biometric Capture App (BCA) to enable biometric data collection on Android devices.

## Component Registration

The component is automatically registered when the mobile app starts. Registration happens in `src/utils/formioComponents.ts` and is called from `src/main.ts`.

## Component Structure

### Vue Component (`src/components/formio/BiometricCapture.vue`)

The Vue component provides the UI for the biometric capture field:

- Displays a capture button with fingerprint icon
- Shows capture status (success/error messages)
- Handles user interaction (button clicks)
- Integrates with the Capacitor plugin to launch BCA

### Form.io Component Class (`src/components/formio/BiometricCaptureComponent.ts`)

The Form.io component class:

- Extends Form.io's `baseComponent`
- Handles Form.io integration (value management, validation)
- Mounts the Vue component for rendering
- Manages component lifecycle (attach/detach)

### Capacitor Plugin (`src/plugins/biometric-capture.ts`)

The TypeScript plugin interface:

- Provides `capture()` method to launch BCA
- Handles Android Intent communication
- Returns capture results as structured data
- Includes web fallback for development

### Android Native Plugin (`android/app/src/main/java/org/idpass/datacollectapp/BiometricCapturePlugin.java`)

The native Android plugin:

- Launches BCA via Android Intent
- Passes capture request parameters
- Waits for BCA result
- Parses and returns capture response

## Data Flow

1. **User Interaction**: User taps "Capture Biometric" button
2. **Plugin Call**: Vue component calls `BiometricCapturePlugin.capture()`
3. **Intent Launch**: Android plugin creates Intent and launches BCA
4. **BCA Processing**: BCA app handles biometric capture
5. **Result Return**: BCA returns result via Intent with extras:
   - `captureResponse`: JSON string with capture data
   - `fingerprintImages`: Array of image URIs (optional)
6. **Data Storage**: Component stores result in Form.io submission data
7. **Form Submission**: Data is included when form is submitted

## Capture Response Structure

The component expects BCA to return data in the following format:

```json
{
  "captureResponse": {
    // BCA-specific response structure
  },
  "fingerprintImages": [
    "content://...",
    "content://..."
  ]
}
```

The Android plugin wraps this with additional metadata:

```json
{
  "captureResponse": { /* BCA response */ },
  "fingerprintImages": [ /* image URIs */ ],
  "timestamp": "2024-01-01T12:00:00Z",
  "success": true
}
```

## Error Handling

The component handles several error scenarios:

- **BCA Not Installed**: Shows error message, prevents capture
- **Capture Cancelled**: User cancels in BCA, component shows cancellation message
- **Capture Failed**: BCA returns error, component displays error message
- **Network Issues**: Handled by standard Form.io error handling

## Testing

### Web Browser Testing

When testing in a web browser, the component will:
- Display the capture button
- Show a mock response when clicked
- Indicate that the feature is mobile-only

### Android Device Testing

1. Ensure BCA is installed on the device
2. Open a form containing the Biometric Capture component
3. Tap the capture button
4. Complete biometric capture in BCA
5. Verify data appears in form submission

## Development Notes

### Adding New Capture Types

To support additional capture types:

1. Update `BiometricCapture.vue` to handle new type
2. Update component schema in `BiometricCaptureComponent.ts`
3. Update admin builder component registration
4. Update BCA integration if needed

### Customizing BCA Integration

To customize how BCA is launched:

1. Modify `BiometricCapturePlugin.java` to change Intent parameters
2. Update `biometric-capture.ts` interface if new options are needed
3. Update component configuration UI in admin builder

## Troubleshooting

### Component Not Rendering

- Check that `registerFormioComponents()` is called in `main.ts`
- Verify Form.io component registration in browser console
- Check for JavaScript errors in console

### Capture Not Launching

- Verify BCA is installed: `adb shell pm list packages | grep idpass.bca`
- Check Android logs: `adb logcat | grep BiometricCapture`
- Verify Intent configuration matches BCA expectations

### Data Not Stored

- Check Form.io submission data structure
- Verify component key matches form schema
- Check browser/device console for errors
- Ensure `setValue()` is called after capture
