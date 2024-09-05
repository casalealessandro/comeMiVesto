import { inject} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CanActivateFn } from '@angular/router';



export const authGuard: CanActivateFn = async (route, state) => { {
      const angularFireAuth = inject(AngularFireAuth);
      const user = await angularFireAuth.currentUser;
      if (user) {
        
        try {
          const token = await user.getIdToken();
            console.log('User token:', token);
            // Utilizza il token se necessario
            return true;
        } catch (error) {
            console.error('Errore nel recupero del token:', error);
            return false;
        }
    } else {
        return false;
    }
  }
  
}
