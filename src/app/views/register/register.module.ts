import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { DynamicFormComponent } from 'src/app/components/dynamic-form/dynamic-form.component';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
      IonicModule,
      FormsModule,
    RegisterPageRoutingModule,
    ComponentsModule
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}
