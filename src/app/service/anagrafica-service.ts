import { Injectable } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { DynamicFormField } from './interface/dynamic-form-field';
import { Observable, finalize, from, lastValueFrom, map, switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class AnagraficaService {
  private batchSize = 20;
  private lastDocument: any | null = null;

  constructor(private firestore: AngularFirestore,private storage: AngularFireStorage,private alertController:AlertController) { }

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
    return this.firestore.collection('outfits').valueChanges()
    .pipe(

      map((outfit: any) => {
        return outfit
        const data = JSON.parse(outfit.oufitJson)
        return data;
      })
    );

   /*  return this.firestore.collection('outfits').doc(userOutFit).valueChanges()
      .pipe(

        map((outfit: any) => {
          const data = JSON.parse(outfit.oufitJson)
          return data;
        })
      ) */


  }

  //Salvataggio in FireStone

  async saveInCollection(nameDoc: string, data: any): Promise<boolean> {
    try {
      await this.firestore.collection('outfits').doc(nameDoc).set(data);
      return true
      
    } catch (error) {
      
        const alert = await this.alertController.create({
          header: 'Attenzione',
          subHeader: '',
          message: `Errore durante il salvataggio del documento:, ${error}`,
          buttons: ['OK']
        });
      
        await alert.present();
      
      //alert(');
      return false
    }
  }

  // Caricamento dell'immagine in Firebase Storage
  
  async uploadImage(filePath: string, fileName: string): Promise<string> {
    const fileRef = this.storage.ref(fileName);
    const task = this.storage.upload(fileName, filePath);

    try {
      let downloadURL =  await lastValueFrom(fileRef.getDownloadURL())
       
      return downloadURL;
    } catch (error) {
      throw new Error('Errore durante il caricamento dell\'immagine: ' + error);
    }
  }
}


