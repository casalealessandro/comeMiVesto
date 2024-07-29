import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyOutFitPage } from './myoutfit.page';

const routes: Routes = [
  {
    path: '',
    component: MyOutFitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyoutfitPageRoutingModule {}
