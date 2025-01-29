import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LayoutTabsPage } from './views/layout-tabs/layout-tabs.page';
import { authGuard } from './auth.guard';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: LayoutTabsPage,
    canActivate: [authGuard], // ✅ Il guardiano qui è corretto
    children: [
      {
        path: 'myoutfit',
        loadChildren: () => import('./views/myoutfit/myoutfit.module').then(m => m.MyOutFitPageModule),
      },
      {
        path: 'detail-outfit/:id',
        loadChildren: () => import('./views/detail-outfit/detail-outfit.module').then(m => m.DetailOutfitPageModule),
        canActivate: [authGuard]
      },
      {
        path: 'add-outfit',
        loadChildren: () => import('./views/add-outfit/add-outfit.module').then(m => m.AddOutfitPageModule),
        canActivate: [authGuard]
      },
      {
        path: 'my-wardrobes',
        loadChildren: () => import('./views/my-wardrobes/my-wardrobes.module').then(m => m.MyWardrobesPageModule),
        canActivate: [authGuard]
      },
      {
        path: 'outfit-products',
        loadChildren: () => import('./views/prodotti-online/prodotti-online.module').then(m => m.ProdottiOnlinePageModule),
      },
      {
        path: 'my-profile',
        loadChildren: () => import('./views/my-profile/my-profile.module').then(m => m.MyProfilePageModule),
        canActivate: [authGuard]
      },
      {
        path: 'layout-tabs',
        loadChildren: () => import('./views/layout-tabs/layout-tabs.module').then(m => m.LayoutTabsPageModule),
        canActivate: [authGuard]
      },
      {
        path: 'filter-outfits',
        loadChildren: () => import('./views/filter-outfits/filter-outfits.module').then(m => m.FilterOutfitsPageModule),
        canActivate: [authGuard]
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
    path: 'terms-conditions',
    loadChildren: () => import('./views/terms-conditions/terms-conditions.module').then(m => m.TermsConditionsPageModule),
  },
  {
    path: '',
    component: AppComponent,  // AppComponent come punto di ingresso
    pathMatch: 'full'
  },
  {
    path: '**',  // Wildcard per gestire rotte non valide
    redirectTo: 'tabs/myoutfit'
  },
  {
    path: 'prodotti-online',
    loadChildren: () => import('./views/prodotti-online/prodotti-online.module').then(m => m.ProdottiOnlinePageModule)
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
