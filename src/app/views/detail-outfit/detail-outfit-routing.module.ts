import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailOutfitPage } from './detail-outfit.page';

const routes: Routes = [
  {
    path: '',
    component: DetailOutfitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailOutfitPageRoutingModule {}
