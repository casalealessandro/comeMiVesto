import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DynamicFormField } from './interface/dynamic-form-field';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnagraficaService {

  constructor(private firestore: AngularFirestore) { }

  getFormFields(nomeAnagrafica:string): Observable<DynamicFormField[]> {
    return this.firestore.collection('forms').doc(nomeAnagrafica).valueChanges()
    .pipe(
      map((formData: any) => {
        const jsonFields = JSON.parse(formData.json);
        return jsonFields as DynamicFormField[];
      })
    );
  }
}
