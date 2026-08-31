import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from './service/user.service';
import { firstValueFrom } from 'rxjs';
import { TermsAcceptanceService } from './service/terms-acceptance.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const angularFireAuth = inject(AngularFireAuth);
  const userService = inject(UserService);
  const router = inject(Router);
  const termsAcceptance = inject(TermsAcceptanceService);
  const loginRedirect = () => router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

  try {
    // Otteniamo l'utente autenticato
    const user = await firstValueFrom(angularFireAuth.authState);

    if (!user) {
      console.warn('Utente non autenticato, reindirizzamento alla login.');
      return loginRedirect();
    }

    // Otteniamo il token di autenticazione
    const token = await user.getIdToken();
    if (!token) {
      console.warn('Token non valido, reindirizzamento alla login.');
      return loginRedirect();
    }

    // Recuperiamo il profilo utente dal backend
    try {
      const profile = await firstValueFrom(userService.getUserProfile(user.uid));
      userService.setUserInfo(profile); // Salviamo il profilo nel service
    } catch (error) {
      console.error('Errore nel recupero del profilo utente:', error);
      return false;
    }

    const decision = await termsAcceptance.allowAppAccess();
    return decision === 'accepted' ? true : decision === 'declined' ? loginRedirect() : false;
  } catch (error) {
    console.error('Errore nella verifica dello stato di autenticazione:', error);
    return loginRedirect();
  }
};
