import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acasale.comemivesto',
  appName: 'Come mi vesto',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: ["*"]
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 5500,  // La durata (in millisecondi) per cui lo splash screen viene mostrato all'avvio dell'applicazione. I
      launchAutoHide: true,      // Fa in modo che lo splash screen si nasconda automaticamente dopo che il tempo definito in launchShowDuration è scaduto.
      backgroundColor: "#ffffff",// Definisce il colore di sfondo dello splash screen.
      androidSplashResourceName: "splash", //Specifica il nome della risorsa dell'immagine dello splash screen su Android. Qui è indicato il file chiamato splash, che deve essere presente tra le risorse Android del progetto.
      androidScaleType: "CENTER_CROP",   // **Proprietà determina come l'immagine dello splash screen viene scalata su Android.
      showSpinner: true, //verrà mostrato un indicatore di caricamento (spinner) sopra lo splash screen, che è utile per far capire all'utente che l'app si sta caricando
      splashFullScreen: true, //lo splash screen verrà visualizzato in modalità full screen (a schermo intero) nascondendo la barra di stato.
      splashImmersive: true, //rende lo splash screen immersivo, nascondendo sia la barra di stato che la barra di navigazione (su dispositivi con tasti software) per offrire un'esperienza più coinvolgente.
      
      spinnerColor: '#000000',       // Colore dello spinner
    
    }
  },
 
};

export default config;


/*
**CENTER_CROP: L'immagine viene scalata per riempire l'intero schermo, mantenendo le proporzioni. Se l'immagine non ha le stesse proporzioni dello schermo, alcune parti potrebbero essere tagliate.

Utilizzo: Puoi modificare questo valore se vuoi un comportamento diverso per l'immagine dello splash screen:

FIT_CENTER: Adatta l'immagine allo schermo mantenendo le proporzioni, ma senza tagliarla (potrebbero esserci bordi vuoti).
CENTER_INSIDE: L'immagine verrà centrata, mantenendo le dimensioni originali se possibile.
*/