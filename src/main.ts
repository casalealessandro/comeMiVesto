import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { StatusBar, Style } from '@capacitor/status-bar';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { SplashScreen } from '@capacitor/splash-screen';

// Call the element loader before the bootstrapModule/bootstrapApplication call
defineCustomElements(window);

if (environment.production) {
  enableProdMode();
}

// Mostra una schermata iniziale e nascondila manualmente
const bootstrap = async () => {
  try {
    // Nascondi lo splash screen quando l'app è pronta
    await SplashScreen.hide();
    await platformBrowserDynamic().bootstrapModule(AppModule);
  } catch (err) {
    console.error('Error during app bootstrap:', err);
  }
};

bootstrap();
