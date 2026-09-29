package com.acasale.comemivesto;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

@CapacitorPlugin(name = "CrashReporting")
public class CrashReportingPlugin extends Plugin {

    @PluginMethod
    public void log(PluginCall call) {
        FirebaseCrashlytics.getInstance().log(call.getString("event", "DIAGNOSTIC_EVENT"));
        call.resolve();
    }

    @PluginMethod
    public void setContext(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        if (key != null && value != null) {
            FirebaseCrashlytics.getInstance().setCustomKey(key, value);
        }
        call.resolve();
    }

    @PluginMethod
    public void recordError(PluginCall call) {
        String errorType = call.getString("errorType", "JavaScriptError");
        String context = call.getString("context", "UNHANDLED_JS_ERROR");
        FirebaseCrashlytics crashlytics = FirebaseCrashlytics.getInstance();
        crashlytics.log(context);
        crashlytics.recordException(new JavaScriptDiagnosticException(errorType));
        call.resolve();
    }

    private static final class JavaScriptDiagnosticException extends Exception {
        JavaScriptDiagnosticException(String errorType) {
            super(errorType);
        }
    }
}
