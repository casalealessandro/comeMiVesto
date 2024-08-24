
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ModalFormComponent } from './modal-form/modal-form.component';
import { DynamicSelectBoxComponent } from './dynamic-form/items/dynamic-select-box/dynamic-select-box.component';
import { ModalListComponent } from './modal-list/modal-list.component';


@NgModule({
	imports: [CommonModule,ScrollingModule,IonicModule,ReactiveFormsModule],
	declarations: [
		DynamicFormComponent,
		DynamicSelectBoxComponent,
		ModalFormComponent,
		ModalListComponent
		
		
	],
	exports: [DynamicFormComponent,ModalFormComponent,ModalListComponent]
})
export class ComponentsModule {

}
