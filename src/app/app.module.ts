import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule, FIREBASE_OPTIONS, } from '@angular/fire/compat'
import { AngularFireAuthModule, USE_EMULATOR as AUTH_USE_EMULATOR } from '@angular/fire/compat/auth';
import { USE_EMULATOR as FIRESTORE_USE_EMULATOR } from '@angular/fire/compat/firestore';
import { USE_EMULATOR as STORAGE_USE_EMULATOR } from '@angular/fire/compat/storage';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from './components/components.module';
import { CommonModule } from '@angular/common';

import { FotoOutfitPage } from './views/foto-outfit/foto-outfit.page';
import { CurrencyFormatPipe } from './utility/currency-format.pipe';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FirebaseAuthInterceptor } from './interceptors/firebase-auth.interceptor';



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
    { provide: HTTP_INTERCEPTORS, useClass: FirebaseAuthInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase},
    ...(environment.useEmulators ? [
      { provide: AUTH_USE_EMULATOR, useValue: ['http://127.0.0.1:9099'] },
      { provide: FIRESTORE_USE_EMULATOR, useValue: ['127.0.0.1', 8080] },
      { provide: STORAGE_USE_EMULATOR, useValue: ['127.0.0.1', 9199] },
    ] : [])
  ],
  bootstrap: [AppComponent],
 
})
export class AppModule { }
