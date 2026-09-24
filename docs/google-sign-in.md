# Google Sign-In

Questa integrazione usa `@capawesome/capacitor-google-sign-in` per il login nativo e converte l'ID token Google in una credenziale Firebase tramite `GoogleAuthProvider`.

## Configurazione richiesta

1. Abilitare Google in Firebase Authentication > Sign-in method.
2. Creare/recuperare il Web OAuth Client ID nello stesso progetto Google Cloud/Firebase.
3. Inserire il Web Client ID in `environment.googleAuth.webClientId`.
4. Android:
   - package: `com.acasale.comemivesto`
   - creare un OAuth Client Android per ogni SHA-1 usato nei test/release;
   - includere lo SHA-1 della firma Google Play per le build distribuite tramite Play App Signing.
5. iOS:
   - bundle ID: `com.acasale.comemivesto`
   - creare l'OAuth Client iOS;
   - aggiungere `GIDClientID` a `ios/App/App/Info.plist`;
   - aggiungere il reversed client ID Google come ulteriore URL scheme, senza rimuovere lo scheme `comemivesto` già presente.

## Flusso

`GoogleSignIn.signIn()`
→ ID token Google
→ `GoogleAuthProvider.credential(...)`
→ `signInWithCredential(...)`
→ Firebase User
→ `resolveSocialAuthentication()`

Il bootstrap è la fonte di verità sul completamento del profilo sociale.

Se `registration.profileComplete` è `true`, l'utente entra normalmente.

Se è `false`, l'app apre `/register?social=google`. Il genere e i Terms sono obbligatori; nome e cognome sono facoltativi e vengono precompilati con `givenName`/`familyName` restituiti dal plugin Google quando disponibili.

Il client non invia `displayName`, email, UID o ruolo: questi dati restano derivati lato backend/Firebase.

Il completamento usa `POST /user/complete-registration` introdotto in firebase-api PR #98.

## Note

Il Web Client ID non è un segreto, ma deve essere quello corretto del progetto. Non inserire Client ID inventati.

La versione web del login Google non è ancora inclusa: il pulsante è mostrato solo su Android/iOS.
