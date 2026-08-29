package com.movietime.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.http.javanet.NetHttpTransport;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifies Google Sign-In ID tokens sent from the React frontend.
 * The frontend obtains the ID token via Google Identity Services and sends it
 * to POST /api/auth/google, where this class verifies signature + audience.
 */
@Component
@RequiredArgsConstructor
public class GoogleTokenVerifier {

    @Value("${google.oauth.client-id}")
    private String googleClientId;

    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            return idToken.getPayload();
        } catch (GeneralSecurityException | java.io.IOException e) {
            throw new IllegalArgumentException("Unable to verify Google ID token", e);
        }
    }
}
