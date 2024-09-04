import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LayoutTabsPage } from './views/layout-tabs/layout-tabs.page';
import { authGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: LayoutTabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'myoutfit',
        loadChildren: () => import('./views/myoutfit/myoutfit.module').then(m => m.MyOutFitPageModule),
        
      },
      {
        path: 'add-outfit',
        loadChildren: () => import('./views/add-outfit/add-outfit.module').then(m => m.AddOutfitPageModule),
        canActivate: [authGuard]
      },
      {
        path: 'my-wardrobes',
        loadChildren: () => import('./views/my-wardrobes/my-wardrobes.module').then(m => m.MyWardrobesPageModule),
        
      },
      {
        path: 'my-profile',
        loadChildren: () => import('./views/my-profile/my-profile.module').then(m => m.MyProfilePageModule),
        
      },
      {
        path: 'layout-tabs',
        loadChildren: () => import('./views/layout-tabs/layout-tabs.module').then(m => m.LayoutTabsPageModule),
        
      },
      {
        path: 'filter-outfits',
        loadChildren: () => import('./views/filter-outfits/filter-outfits.module').then( m => m.FilterOutfitsPageModule)
      },
    
      {
        path: '',
        redirectTo: '/tabs/myoutfit',
        pathMatch: 'full'
      }

    ]
  },
  {
    path: 'register',
    loadChildren: () => import('./views/register/register.module').then(m => m.RegisterPageModule),
    
  },
  {
    path: 'login',
    loadChildren: () => import('./views/login/login.module').then(m => m.LoginPageModule),
    
  },

  {
    path: '',
    redirectTo: 'tabs/myoutfit',
    pathMatch: 'full'
  },
  {
    path: '**',  // Aggiungi una wildcard per gestire eventuali rotte non valide
    redirectTo: 'tabs/myoutfit'
  },
  

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
