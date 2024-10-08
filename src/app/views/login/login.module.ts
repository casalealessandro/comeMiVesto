import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { ComponentsModule } from 'src/app/components/components.module';



@NgModule({
    declarations: [LoginPage],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        LoginPageRoutingModule,
        ComponentsModule
    ]
})
export class LoginPageModule {}
