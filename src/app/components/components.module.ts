
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ModalFormComponent } from './modal-form/modal-form.component';


@NgModule({
	imports: [CommonModule,ScrollingModule,IonicModule,ReactiveFormsModule],
	declarations: [
		DynamicFormComponent,
		ModalFormComponent,
		
		
	],
	exports: [DynamicFormComponent,ModalFormComponent]
})
export class ComponentsModule {

}
