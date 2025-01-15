import { inject} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CanActivateFn } from '@angular/router';
import { UserService } from './service/user.service';



export const authGuard: CanActivateFn = async (route, state) => { {
      const angularFireAuth = inject(AngularFireAuth);
      const userService = inject(UserService);
      const user = await angularFireAuth.currentUser;
      if (user) {
        
        try {
          const token = await user.getIdToken();
          userService.userInfo = user
            // Utilizza il token se necessario
            if(token){
              return true;
            }else{
              return false;
            }
              
        } catch (error) {
            console.error('Errore nel recupero del token:', error);
            return false;
        }
    } else {
        return false;
    }
  }
  
}
