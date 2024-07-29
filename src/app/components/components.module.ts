
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
	imports: [CommonModule,ScrollingModule,IonicModule,ReactiveFormsModule],
	declarations: [
		DynamicFormComponent,
		
	],
	exports: [DynamicFormComponent]
})
export class ComponentsModule {

}
