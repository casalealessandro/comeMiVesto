import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'myoutfit',
    loadChildren: () => import('./views/myoutfit/myoutfit.module').then( m => m.MyOutFitPageModule)
  },
  {
    path: '',
    redirectTo: 'myoutfit',
    pathMatch: 'full'
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
    path: 'filter-modal',
    loadChildren: () => import('./views/filter-modal/filter-modal.module').then( m => m.FilterModalPageModule)
  },
  {
    path: 'add-outfit',
    loadChildren: () => import('./views/add-outfit/add-outfit.module').then( m => m.AddOutfitPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
