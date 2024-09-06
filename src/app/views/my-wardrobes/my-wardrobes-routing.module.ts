import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyWardrobesPage } from './my-wardrobes.page';

const routes: Routes = [
  {
    path: '',
    component: MyWardrobesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyWardrobesPageRoutingModule {}
