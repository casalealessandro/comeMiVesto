import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule, FIREBASE_OPTIONS, } from '@angular/fire/compat'
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from './components/components.module';
import { CommonModule } from '@angular/common';

import { FotoOutfitPage } from './views/foto-outfit/foto-outfit.page';
import { CurrencyFormatPipe } from './utility/currency-format.pipe';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';



@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    
    IonicModule.forRoot(),
    AppRoutingModule,
    ScrollingModule,
    AngularFireAuthModule ,// Aggiunge AngularFireAuthModule come modulo importato
    ReactiveFormsModule,
    ComponentsModule,
    AngularFireModule.initializeApp(environment.firebase),
     
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase}
  ],
  bootstrap: [AppComponent],
 
})
export class AppModule { }


