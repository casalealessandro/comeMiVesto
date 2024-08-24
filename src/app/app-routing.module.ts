import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'myoutfit',
    loadChildren: () => import('./views/myoutfit/myoutfit.module').then( m => m.MyOutFitPageModule)
  },
  
  {
    path: 'register',
    loadChildren: () => import('./views/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./views/login/login.module').then( m => m.LoginPageModule)
  },
  
  {
    path: 'add-outfit',
    loadChildren: () => import('./views/add-outfit/add-outfit.module').then( m => m.AddOutfitPageModule)
  },
  {
    path: 'my-wardrobes',
    loadChildren: () => import('./views/my-wardrobes/my-wardrobes.module').then( m => m.MyWardrobesPageModule)
  },  {
    path: 'my-profile',
    loadChildren: () => import('./views/my-profile/my-profile.module').then( m => m.MyProfilePageModule)
  },


  



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
