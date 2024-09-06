import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilterOutfitsPage } from './filter-outfits.page';

const routes: Routes = [
  {
    path: '',
    component: FilterOutfitsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilterOutfitsPageRoutingModule {}
