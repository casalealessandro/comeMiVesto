import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddOutfitPage } from './add-outfit.page';

const routes: Routes = [
  {
    path: '',
    component: AddOutfitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddOutfitPageRoutingModule {}
