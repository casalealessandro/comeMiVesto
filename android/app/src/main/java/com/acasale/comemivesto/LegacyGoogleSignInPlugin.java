package com.acasale.comemivesto;

import android.content.Intent;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "LegacyGoogleSignIn")
public class LegacyGoogleSignInPlugin extends Plugin {

    private GoogleSignInClient client;

    @PluginMethod
    public void signIn(PluginCall call) {
        String clientId = call.getString("clientId");
        if (clientId == null || clientId.trim().isEmpty()) {
            call.reject("Google Web Client ID is missing", "GOOGLE_CLIENT_ID_NOT_CONFIGURED");
            return;
        }

        client = createClient(clientId);
        startActivityForResult(call, client.getSignInIntent(), "signInResult");
    }

    @ActivityCallback
    private void signInResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        Intent data = result.getData();
        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);

        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            String idToken = account.getIdToken();
            if (idToken == null || idToken.isEmpty()) {
                call.reject("Google ID token missing", "GOOGLE_ID_TOKEN_MISSING");
                return;
            }

            JSObject response = new JSObject();
            response.put("idToken", idToken);
            response.put("email", account.getEmail());
            response.put("displayName", account.getDisplayName());
            response.put("givenName", account.getGivenName());
            response.put("familyName", account.getFamilyName());
            response.put("imageUrl", account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : null);
            call.resolve(response);
        } catch (ApiException error) {
            call.reject(
                "Legacy Google Sign-In failed with status " + error.getStatusCode(),
                "GOOGLE_SIGN_IN_FAILED_" + error.getStatusCode()
            );
        } catch (Exception error) {
            call.reject("Legacy Google Sign-In failed: " + error.getMessage(), "GOOGLE_SIGN_IN_FAILED");
        }
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        String clientId = call.getString("clientId");
        if (clientId == null || clientId.trim().isEmpty()) {
            call.reject("Google Web Client ID is missing", "GOOGLE_CLIENT_ID_NOT_CONFIGURED");
            return;
        }

        GoogleSignInClient signOutClient = client != null ? client : createClient(clientId);
        signOutClient
            .signOut()
            .addOnSuccessListener(unused -> call.resolve())
            .addOnFailureListener(error ->
                call.reject("Google Sign-Out failed: " + error.getMessage(), "GOOGLE_SIGN_OUT_FAILED")
            );
    }

    private GoogleSignInClient createClient(String clientId) {
        GoogleSignInOptions options = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(clientId.trim())
            .requestEmail()
            .requestProfile()
            .build();

        return GoogleSignIn.getClient(getActivity(), options);
    }
}
