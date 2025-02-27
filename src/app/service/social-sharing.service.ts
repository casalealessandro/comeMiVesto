// social-sharing.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { outfit } from 'src/app/service/interface/outfit-all-interface';
@Injectable({
  providedIn: 'root', // Questo rende il servizio disponibile in tutta l'app
})
export class SocialSharing {
  constructor(private router: Router) { } // Iniezione di Router tramite il costruttore

  private getShareUrl(id: number): string { // Cambiato 'any' in 'number'
    const appUrl = `myapp://outfit/${id}`; // Deep link per l'app
    const webUrl = `https://comemivesto.app${this.router.createUrlTree(['/detail-outfit/', id]).toString()}`; // URL per il browser

    // Puoi decidere quale URL mostrare in base all'ambiente
    return webUrl;  // Torna il deep link per l'app
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
        url: url,  // URL del deep link
        dialogTitle: dialogTitle,
      });
    } catch (error) {
      console.error('Errore durante la condivisione:', error);
    }
  }

  // Le funzioni di condivisione commentate possono essere rimosse o tenute per riferimento futuro
  /* 
  private async shareOnInstagram(imagePath: string) {
    // Codice...
  }

  private async shareOnPinterest(url: string, description: string) {
    // Codice...
  }

  private async shareOnFacebook(url: string) {
    // Codice...
  }

  private async shareOnWhatsApp(url: string, text: string) {
    // Codice...
  }

  private async shareViaEmail(url: string, text: string) {
    // Codice...
  }

  private async copyLink(url: string) {
    // Codice...
  }
  */
}
