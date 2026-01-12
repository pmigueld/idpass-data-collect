# Biometric Capture Component

The Biometric Capture component allows administrators to add biometric data collection capabilities to forms built in the Form Builder.

## Overview

The Biometric Capture component integrates with the ID PASS Biometric Capture App (BCA) to enable fingerprint, face, and iris capture on Android devices. When added to a form, it provides a button that launches the BCA app to capture biometric data, which is then stored as part of the form submission.

## Prerequisites

- The Biometric Capture App (BCA) must be installed on Android devices where forms will be used
- BCA package: `io.idpass.bca`
- BCA Main Activity: `io.idpass.bca.MainActivity`
- BCA Intent Action: `io.idpass.bca.CAPTURE`

## Adding the Component to a Form

1. Open the Form Builder for your entity form
2. In the component palette, find the "Biometric Capture" component under the "Custom" group
3. Drag and drop the component onto your form
4. Configure the component settings (see Configuration Options below)

## Configuration Options

The Biometric Capture component supports the following configuration options:

### Basic Settings

- **Label**: The label displayed above the capture button
- **Property Name (Key)**: The field name used in form submissions (e.g., `biometricData`)
- **Required**: Whether the field must be filled before form submission

### Advanced Settings (Custom Options)

- **Intent Action**: The Android intent action to launch BCA (default: `io.idpass.bca.CAPTURE`)
- **Intent Package**: The BCA package name (default: `io.idpass.bca`)
- **Intent Class**: The BCA main activity class (default: `io.idpass.bca.MainActivity`)
- **Capture Type**: Type of biometric to capture
  - `fingerprint` (default)
  - `face`
  - `iris`
- **Capture Format**: Response format (default: `json`)

## Data Structure

When a biometric is captured, the component stores the following data structure in the form submission:

```json
{
  "captureResponse": {
    // BCA response data (structure depends on BCA implementation)
  },
  "fingerprintImages": [
    // Array of image URIs (if applicable)
  ],
  "timestamp": "2024-01-01T12:00:00Z",
  "success": true
}
```

## Mobile App Behavior

When a form containing the Biometric Capture component is opened on a mobile device:

1. The component displays a "Capture Biometric" button
2. Tapping the button launches the BCA app via Android Intent
3. The user completes the biometric capture in BCA
4. BCA returns the capture result to the mobile app
5. The component displays capture status and stores the data
6. The captured data is included in the form submission when the form is saved

## Limitations

- **Android Only**: This component only works on Android devices. On other platforms, it will display but capture will not function.
- **BCA Required**: The BCA app must be installed on the device. If not installed, an error message will be displayed.
- **Web Fallback**: When testing in a web browser, the component will show a mock response indicating the feature is not available.

## Troubleshooting

### BCA Not Found Error

If you see "Biometric Capture App (BCA) is not installed", ensure:
- BCA is installed on the Android device
- The package name matches the configured Intent Package
- The device has proper permissions to launch external apps

### Capture Not Working

- Verify BCA is properly installed and can be launched manually
- Check that the Intent Action, Package, and Class match your BCA installation
- Review device logs for detailed error messages

## Example Form Configuration

```json
{
  "components": [
    {
      "type": "biometricCapture",
      "label": "Fingerprint Capture",
      "key": "fingerprint",
      "validate": {
        "required": true
      },
      "customOptions": {
        "intentAction": "io.idpass.bca.CAPTURE",
        "intentPackage": "io.idpass.bca",
        "intentClass": "io.idpass.bca.MainActivity",
        "captureType": "fingerprint",
        "captureFormat": "json"
      }
    }
  ]
}
```
