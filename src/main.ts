import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { StatusBar, Style } from '@capacitor/status-bar';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
// Call the element loader before the bootstrapModule/bootstrapApplication call
defineCustomElements(window);
if (environment.production) {
  enableProdMode();
}



platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));



/* 
const configureStatusBar = async () => {
  try {
    // Imposta lo stile chiaro (icone nere)
    await StatusBar.setStyle({ style: Style.Light });

    // Imposta il colore di sfondo della barra di stato
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });

    // Mostra la barra di stato se è nascosta
    await StatusBar.show();
  } catch (error) {
    console.error('Errore nella configurazione della StatusBar:', error);
  }
};

configureStatusBar(); */