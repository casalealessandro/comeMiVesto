import { inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CanActivateFn } from '@angular/router';
import { UserService } from './service/user.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const angularFireAuth = inject(AngularFireAuth);
  const userService = inject(UserService);

  try {
    // Attendi il primo valore disponibile dallo stato di autenticazione
    const user = await firstValueFrom(angularFireAuth.authState);

    if (user) {
      const token = await user.getIdToken();
      //userService.userInfo = user;

      return !!token; //trasforma il token stringa in boolean se è diverso da vuoto è true
    } else {
      
      return false;
    }
  } catch (error) {
    console.error('Errore nel recupero dello stato di autenticazione:', error);
    return false;
  }
};
