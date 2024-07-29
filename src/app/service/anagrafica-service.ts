import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot, } from '@angular/fire/compat/firestore';
import { DynamicFormField } from './interface/dynamic-form-field';
import { Observable, from, lastValueFrom, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnagraficaService {
  private batchSize = 20;
  private lastDocument: any | null = null;

  constructor(private firestore: AngularFirestore) { }

  getFormFields(nomeAnagrafica: string): Observable<DynamicFormField[]> {
    return this.firestore.collection('forms').doc(nomeAnagrafica).valueChanges()
      .pipe(
        map((formData: any) => {
          const jsonFields = JSON.parse(formData.json);
          return jsonFields as DynamicFormField[];
        })
      );
  }

  getOutfits(userOutFit: string): Observable<any[]> {

    return this.firestore.collection('outfits').doc(userOutFit).valueChanges()
      .pipe(

        map((outfit: any) => {
          const data = JSON.parse(outfit.oufitJson)
          return data;
        })
      )


  }
}


