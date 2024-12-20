
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';

import { CommonModule } from '@angular/common';

import { ModalFormComponent } from './modal-form/modal-form.component';
import { DynamicSelectBoxComponent } from './dynamic-form/items/dynamic-select-box/dynamic-select-box.component';
import { ModalListComponent } from './modal-list/modal-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DynamicFileBoxComponent } from './dynamic-form/items/dynamic-file-box/dynamic-file-box.component';
import { ProductsGridComponent } from '../views/products-grid/products-grid.component';
import { SharedModule } from "../views/shared/shared.module";

import { HeaderComponent } from '../layout/header/header.component';
import { MenuComponent } from '../layout/menu/menu.component';




@NgModule({
	imports: [CommonModule, ScrollingModule, IonicModule, FormsModule, ReactiveFormsModule, SharedModule],
	declarations: [
		DynamicFormComponent,
		DynamicSelectBoxComponent,
		DynamicFileBoxComponent,
		ModalFormComponent,
		ModalListComponent,
		ProductsGridComponent,
		MenuComponent,
		HeaderComponent
	],
	exports: [DynamicFormComponent, ModalFormComponent, ModalListComponent, ProductsGridComponent, MenuComponent,HeaderComponent]
})
export class ComponentsModule {

}
