import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './service/user.service';
import { TermsAcceptanceService } from './service/terms-acceptance.service';
import { FirebaseService } from './service/firebase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const firebase = inject(FirebaseService);
  const userService = inject(UserService);
  const router = inject(Router);
  const termsAcceptance = inject(TermsAcceptanceService);
  const loginRedirect = () => router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

  try {
    // Otteniamo l'utente autenticato
    const user = await firebase.waitForAuthState();

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

    // Inizializziamo una sola volta lo stato applicativo dell'utente
    if (!userService.isBootstrapReady(user.uid)) {
      try {
        await userService.loadBootstrap();
      } catch (error) {
        console.error('Errore nel bootstrap della sessione utente:', error);
        return false;
      }
    }

    const decision = await termsAcceptance.allowAppAccess(user.uid, userService.gTermsStatus()() ?? undefined);
    return decision === 'accepted' ? true : decision === 'declined' ? loginRedirect() : false;
  } catch (error) {
    console.error('Errore nella verifica dello stato di autenticazione:', error);
    return loginRedirect();
  }
};
