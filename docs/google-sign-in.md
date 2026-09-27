# Google Sign-In

Questa integrazione converte l'ID token Google in una credenziale Firebase tramite `GoogleAuthProvider`. Su Android il flusso nativo usa il bridge custom `LegacyGoogleSignInPlugin` basato su `GoogleSignInClient`; su iOS usa `@capawesome/capacitor-google-sign-in`. In entrambi i casi l'autenticazione Firebase finale resta gestita dal Firebase JS SDK (`firebase/auth`).

## Configurazione richiesta

1. Abilitare Google in Firebase Authentication > Sign-in method.
2. Creare/recuperare il Web OAuth Client ID nello stesso progetto Google Cloud/Firebase.
3. Inserire il Web Client ID in `environment.googleAuth.webClientId`.
4. Android:
   - package: `com.acasale.comemivesto`
   - creare un OAuth Client Android per ogni SHA-1 usato nei test/release;
   - includere lo SHA-1 della firma Google Play per le build distribuite tramite Play App Signing;
   - SHA-1 Play verificato a runtime per l'app distribuita: `19:10:0E:BA:6A:25:8F:A6:CC:B2:3C:A3:F8:11:7E:01:80:18:B3:3B`;
   - lo stesso SHA-1 deve essere registrato sia nell'app Android Firebase sia in un OAuth Client Android Google Cloud associato a `com.acasale.comemivesto`.
5. iOS:
   - bundle ID: `com.acasale.comemivesto`
   - creare l'OAuth Client iOS;
   - scaricare dalla stessa app Firebase iOS il relativo `GoogleService-Info.plist`;
   - usare i valori `CLIENT_ID` e `REVERSED_CLIENT_ID` del plist rispettivamente come `GIDClientID` e URL scheme Google;
   - preservare lo scheme custom `comemivesto` insieme a quello Google.

`GoogleService-Info.plist` non deve essere committato. La pipeline TestFlight lo ricostruisce dal secret GitHub `IOS_GOOGLE_SERVICE_INFO_PLIST_BASE64`, quindi configura e valida automaticamente l'`Info.plist` realmente usato dal target App (`ios/App/App/Info.plist`). La validazione fallisce prima dell'archive se i client ID mancano o non corrispondono, se lo scheme custom è stato rimosso oppure se il bundle ID non è `com.acasale.comemivesto`.

### Configurazione locale iOS

Su macOS, per una build o un test locale:

1. copiare il plist Firebase iOS in `ios/App/App/GoogleService-Info.plist` senza aggiungerlo a Git;
2. eseguire la build web e `npx cap sync ios`;
3. eseguire lo stesso configuratore usato dalla CI:

   ```bash
   python3 .github/scripts/configure-ios-google-sign-in.py \
     --google-plist ios/App/App/GoogleService-Info.plist \
     --info-plist ios/App/App/Info.plist \
     --project ios/App/App.xcodeproj/project.pbxproj
   ```

4. aprire `ios/App/App.xcworkspace`, verificare che `GoogleService-Info.plist` appartenga al target App e provare il login su un iPhone reale.

Il plist è escluso da `.gitignore`; non forzarne mai il commit. Le modifiche locali con i client ID nell'`Info.plist` devono rimanere non committate e possono essere ripristinate dopo il test.

## Flusso

Android: `LegacyGoogleSignInPlugin.signIn()`  
iOS: `GoogleSignIn.signIn()`  
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


## Verifica Android conclusiva

Il login Google Android è stato validato su una build distribuita tramite Google Play Internal Testing. Il problema `GOOGLE_SIGN_IN_FAILED_10` / `DEVELOPER_ERROR` era causato dalla mancata registrazione dello SHA-1 reale della firma Play presso Firebase/Google OAuth. Dopo la registrazione dello SHA-1 Play effettivo, il login è risultato funzionante end-to-end.
