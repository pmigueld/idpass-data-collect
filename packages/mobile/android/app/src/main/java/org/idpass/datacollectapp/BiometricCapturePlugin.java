package org.idpass.datacollectapp;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

@CapacitorPlugin(name = "BiometricCapture")
public class BiometricCapturePlugin extends Plugin {

    private static final String TAG = "BiometricCapturePlugin";
    private static final int CAPTURE_REQUEST_CODE = 1001;

    @PluginMethod
    public void capture(PluginCall call) {
        JSObject requestOptions = call.getObject("options", new JSObject());
        String intentAction = requestOptions.getString("intentAction", "io.idpass.bca.CAPTURE");
        String intentPackage = requestOptions.getString("intentPackage", "io.idpass.bca");
        String intentClass = requestOptions.getString("intentClass", "io.idpass.bca.MainActivity");
        String captureType = requestOptions.getString("captureType", "fingerprint");
        String captureFormat = requestOptions.getString("captureFormat", "json");

        try {
            Intent intent = new Intent(intentAction);
            intent.setClassName(intentPackage, intentClass);
            
            // Add capture request extras
            intent.putExtra("captureType", captureType);
            intent.putExtra("captureFormat", captureFormat);
            intent.putExtra("requestId", call.getCallbackId());

            Activity activity = getActivity();
            if (activity == null) {
                call.reject("Activity is null");
                return;
            }

            // Check if the BCA app is available
            if (intent.resolveActivity(activity.getPackageManager()) == null) {
                call.reject("Biometric Capture App (BCA) is not installed. Please install io.idpass.bca");
                return;
            }

            // Start activity for result
            startActivityForResult(call, intent, CAPTURE_REQUEST_CODE);
        } catch (Exception e) {
            Log.e(TAG, "Error launching BCA intent", e);
            call.reject("Failed to launch biometric capture: " + e.getMessage());
        }
    }

    @Override
    protected void handleOnActivityResult(Activity activity, PluginCall call, int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(activity, call, requestCode, resultCode, data);

        if (requestCode == CAPTURE_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                try {
                    JSObject result = new JSObject();
                    
                    // Extract CaptureResponse JSON from intent
                    String captureResponseJson = data.getStringExtra("captureResponse");
                    if (captureResponseJson != null) {
                        JSONObject captureResponseObj = new JSONObject(captureResponseJson);
                        JSObject captureResponse = JSObject.fromJSONObject(captureResponseObj);
                        result.put("captureResponse", captureResponse);
                    }

                    // Extract fingerprint images (URIs)
                    String[] fingerprintImageUris = data.getStringArrayExtra("fingerprintImages");
                    if (fingerprintImageUris != null && fingerprintImageUris.length > 0) {
                        result.put("fingerprintImages", fingerprintImageUris);
                    }

                    // Add timestamp
                    result.put("timestamp", java.time.Instant.now().toString());
                    result.put("success", true);

                    call.resolve(result);
                } catch (JSONException e) {
                    Log.e(TAG, "Error parsing capture response", e);
                    call.reject("Failed to parse capture response: " + e.getMessage());
                } catch (Exception e) {
                    Log.e(TAG, "Error processing capture result", e);
                    call.reject("Failed to process capture result: " + e.getMessage());
                }
            } else if (resultCode == Activity.RESULT_CANCELED) {
                call.reject("Biometric capture was cancelled");
            } else {
                String errorMessage = data != null ? data.getStringExtra("error") : "Unknown error";
                call.reject("Biometric capture failed: " + (errorMessage != null ? errorMessage : "Unknown error"));
            }
        }
    }
}
