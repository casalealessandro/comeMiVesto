import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutTabsPage } from './layout-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: LayoutTabsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutTabsPageRoutingModule {}
