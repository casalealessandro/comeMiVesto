import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, Query} from '@angular/fire/compat/firestore';
import { DynamicFormField } from './interface/dynamic-form-field';
import { Observable, finalize, from, lastValueFrom, map, switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertController } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})


export class AppService {
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

  getOutfits(userOutFit?: string): Observable<any[]> {
    return this.firestore.collection('outfits').valueChanges()
    .pipe(

      map((outfit: any) => {
        return outfit
        const data = JSON.parse(outfit.oufitJson)
        return data;
      })
    );

   
  }

 async getFilteredCollection(collection: string, conditions:{field:string;operator:string;value:string}[]): Promise<any[]> {
    let query:any = this.firestore.collection(collection).ref;

    // Applica tutte le condizioni alla query
    conditions.forEach(condition => {
      query = query.where(condition.field, condition.operator, condition.value);
    });

    try {
      const querySnapshot = await query.get();
      const results = querySnapshot.docs.map((doc:any) => doc.data());
      return results;
    } catch (error) {
      console.error('Error getting filtered collection:', error);
      return [];
    }
   
    
    
  }
  
  //Salvataggio in FireStone

  async saveInCollection(collection:string,nameDoc: string|undefined, data: any): Promise<boolean> {
    try {
      const Collection = await this.firestore.collection(collection)
      if(!nameDoc){
        Collection.add(data);
        return true
      }else{  
        Collection.doc(nameDoc).set(data);
        return true
      }
      
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

  //Modifica in FireStone

  async updateInCollection(collection:string,nameDoc:any,data: Partial<any>): Promise<boolean> {
    try {
      
        this.firestore.collection(collection).doc(nameDoc).update(data);

        return true
      
      
    } catch (error) {

      return false
    }
   
  }

  // Eliminare documenti in FireStone
  async deleteDocuments(collection: string, conditions: Array<{ field: string, operator: string, value: any }>): Promise<boolean> {
    let query:any = this.firestore.collection(collection).ref;

    // Applica tutte le condizioni alla query
    conditions.forEach(condition => {
      query = query.where(condition.field, condition.operator, condition.value);
    });

    try {
      const querySnapshot = await query.get();
      // Elimina tutti i documenti che corrispondono alla query
      const deletePromises = querySnapshot.docs.map((doc:any) => doc.ref.delete());
      await Promise.all(deletePromises);
      return true
    } catch (error) {
      console.error('Error deleting documents:', error);
      return false
    }
  }
  // Caricamento dell'immagine in Firebase Storage
  
  async uploadImage(filePath: Blob, fileName: string,contentType:string): Promise<string> {
    const fileRef = this.storage.ref(fileName);
    let metaData={
      contentType: contentType 
    }
    
    const task = this.storage.upload(fileName, filePath,metaData);

    try {
      await task;  // Assicurati che l'upload sia completato prima di ottenere l'URL
      let downloadURL =  await lastValueFrom(fileRef.getDownloadURL())
       
      return downloadURL;
    } catch (error) {
      throw new Error('Errore durante il caricamento dell\'immagine: ' + error);
    }
  }
}


