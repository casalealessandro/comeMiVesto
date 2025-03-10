import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { Platform } from '@ionic/angular'; // Per verificare la piattaforma
import { outfit } from 'src/app/service/interface/outfit-all-interface';

@Injectable({
  providedIn: 'root',
})
export class SocialSharing {
  constructor(private router: Router) { } // Iniezione di Router tramite il costruttore

  private getShareUrl(id: number): string { // Cambiato 'any' in 'number'
    const appUrl = `comemivesto://outfit/${id}`; // Deep link per l'app
    const webUrl = `https://comemivesto.app${this.router.createUrlTree(['/detail-outfit/', id]).toString()}`; // URL per il browser

   
    return webUrl; // Restituisce il link web per il browser
  }

  public async shareVia(outfit: outfit): Promise<void> {
    const url = this.getShareUrl(outfit.id);
    const title = outfit.title;
    const message = outfit.description;
    const dialogTitle = title;

    try {
      await Share.share({
        title: title,
        text: message,
        url: url,  // URL del deep link o web
        dialogTitle: dialogTitle,
      });
    } catch (error) {
      console.error('Errore durante la condivisione:', error);
    }
  }

  // Funzione per la condivisione su WhatsApp
  private async shareOnWhatsApp(url: string, text: string) {
    try {
      await Share.share({
        title: 'Condividi su WhatsApp',
        text: text,
        url: `https://wa.me/?text=${encodeURIComponent(url)}`,
        dialogTitle: 'Condividi su WhatsApp',
      });
    } catch (error) {
      console.error('Errore durante la condivisione su WhatsApp:', error);
    }
  }

  // Funzione per la condivisione su Pinterest
  private async shareOnPinterest(url: string, description: string) {
    const pinterestUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}`;
    try {
      await Share.share({
        title: 'Condividi su Pinterest',
        url: pinterestUrl,
        dialogTitle: 'Condividi su Pinterest',
      });
    } catch (error) {
      console.error('Errore durante la condivisione su Pinterest:', error);
    }
  }

  // Altre piattaforme di condivisione possono essere aggiunte similmente
}
