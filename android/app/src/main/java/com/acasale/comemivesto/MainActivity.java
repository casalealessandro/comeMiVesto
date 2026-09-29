package com.acasale.comemivesto;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LegacyGoogleSignInPlugin.class);
        registerPlugin(CrashReportingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
