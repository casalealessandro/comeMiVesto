import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from './service/user.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const angularFireAuth = inject(AngularFireAuth);
  const userService = inject(UserService);

  try {
    // Otteniamo l'utente autenticato
    const user = await firstValueFrom(angularFireAuth.authState);

    if (!user) {
      console.warn('Utente non autenticato, reindirizzamento alla login.');
      return false;
    }

    // Otteniamo il token di autenticazione
    const token = await user.getIdToken();
    if (!token) {
      console.warn('Token non valido, reindirizzamento alla login.');
      return false;
    }

    // Recuperiamo il profilo utente dal backend
    try {
      const profile = await firstValueFrom(userService.getUserProfile(user.uid));
      userService.setUserInfo(profile); // Salviamo il profilo nel service
    } catch (error) {
      console.error('Errore nel recupero del profilo utente:', error);
    }

    return true;
  } catch (error) {
    console.error('Errore nella verifica dello stato di autenticazione:', error);
    return false;
  }
};
