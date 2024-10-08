import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProdottiOnlinePage } from './prodotti-online.page';

const routes: Routes = [
  {
    path: '',
    component: ProdottiOnlinePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProdottiOnlinePageRoutingModule {}
