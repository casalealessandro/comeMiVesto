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
        try {
            FirebaseCrashlytics.getInstance().log(call.getString("event", "DIAGNOSTIC_EVENT"));
        } catch (Throwable ignored) {
            // The diagnostics bridge is deliberately best-effort.
        } finally {
            call.resolve();
        }
    }

    @PluginMethod
    public void setContext(PluginCall call) {
        try {
            String key = call.getString("key");
            String value = call.getString("value");
            if (key != null && value != null) {
                FirebaseCrashlytics.getInstance().setCustomKey(key, value);
            }
        } catch (Throwable ignored) {
            // The diagnostics bridge is deliberately best-effort.
        } finally {
            call.resolve();
        }
    }

    @PluginMethod
    public void recordError(PluginCall call) {
        try {
            String errorType = call.getString("errorType", "JavaScriptError");
            String context = call.getString("context", "UNHANDLED_JS_ERROR");
            FirebaseCrashlytics crashlytics = FirebaseCrashlytics.getInstance();
            crashlytics.log(context);
            crashlytics.recordException(new JavaScriptDiagnosticException(errorType));
        } catch (Throwable ignored) {
            // The diagnostics bridge is deliberately best-effort.
        } finally {
            call.resolve();
        }
    }

    private static final class JavaScriptDiagnosticException extends Exception {
        JavaScriptDiagnosticException(String errorType) {
            super(errorType);
        }
    }
}
