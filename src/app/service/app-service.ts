import { Injectable, signal } from '@angular/core';
import { AngularFirestore, CollectionReference, Query } from '@angular/fire/compat/firestore';
import { DynamicFormField } from './interface/dynamic-form-field';
import { Observable, finalize, from, lastValueFrom, map, switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AlertController } from '@ionic/angular';
import { UserProfile } from './interface/user-interface';
import { FireBaseConditions } from './interface/outfit-all-interface';



@Injectable({
  providedIn: 'root'
})


export class AppService {
  private batchSize = 20;
  private lastDocument: any | null = null;
   // Crea un Signal per il wardrobe
  resultsSignal = signal<any[]>([]);

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage, private alertController: AlertController) { }

  getFormFields(nomeAnagrafica: string): Observable<DynamicFormField[]> {
    return this.firestore.collection('forms').doc(nomeAnagrafica).valueChanges()
      .pipe(
        map((formData: any) => {
          const jsonFields = JSON.parse(formData.json);
          return jsonFields as DynamicFormField[];
        })
      );
  }

  getOutfits(userOutFit?: string) {
      let c= this.firestore.collection('outfits').ref
        c.where('tags', 'array-contains', [{
          
          outfitSubCategory: 'SNK'
      }]).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc, " => ", doc.data());
        });
    });

  }

  getUserProfilebyId(userUid: any): Observable<UserProfile> {
    let usersC = this.firestore.collection('users').doc(userUid).valueChanges()
    return usersC.pipe(

      map((user: any) => {
        return user
      
      })
    );
  }

  async getFilteredCollection(collection: string, conditions?:FireBaseConditions[],orderBy?:any[]): Promise<any[]> {
    
    let query: any = this.firestore.collection(collection).ref;
    
    if(conditions){
      // Applica tutte le condizioni alla query 
      conditions.forEach(condition => {
        
        query = query.where(condition.field, condition.operator, condition.value);
        //console.log('conditions-->',query)
      });
    }

    if(orderBy){
      // Applica l'ordinamento alla query
      orderBy.forEach(order => {
        query = query.orderBy(order.field, order.by);
      });
    }
     
    
    try {
      
      const querySnapshot = await query.get();

      const results = querySnapshot.docs.map((doc: any) => doc.data());
      this.resultsSignal.set(results);
      return results;
    } catch (error) {
      console.error('Error getting filtered collection:', error);
      return [];
    }



  }

  async getFilteredOutfits(conditions: FireBaseConditions[]): Promise<any[]> {
    
    const db: any = this.firestore.collection('outfits').ref;
    
    if(conditions.length==0){
      try {
        const querySnapshot = await db.get();
        const results = querySnapshot.docs.map((doc: any) => doc.data());
        this.resultsSignal.set(results);
        return results;
      } catch (error) {
        console.error('Error getting filtered collection:', error);
        return [];
      }
    }
    
    const queryPromises: Promise<any>[] = [];

    // Raggruppa le condizioni in base all'operatore
    const simpleConditions = conditions.filter(c => c.operator === '==');
    const arrayConditions = conditions.filter(c => c.operator === 'array-contains-any');

    // Esegui query per condizioni semplici (==)
    let baseQuery 
    if (simpleConditions.length > 0) {
      simpleConditions.forEach((condition:any) => {
       // query =  query.where(condition.field, condition.operator, condition.value);
        const query = db.where(condition.field, condition.operator, condition.value);
        queryPromises.push(query.get());
      });
    }
    
    

    // Esegui query separate per ciascuna condizione con 'array-contains-any'
    arrayConditions.forEach((condition:any) => {
      const query = db.where(condition.field, condition.operator, condition.value);
      queryPromises.push(query.get());
    });

    try {
      // Attendi tutte le query
      const querySnapshots = await Promise.all(queryPromises);

      // Estrai i dati da ogni querySnapshot
      let combinedResults: any[] = [];
      querySnapshots.forEach(snapshot => {
        snapshot.docs.forEach((doc:any) => {
          combinedResults.push(doc.data());
        });
      });

      // Rimuovi i duplicati basandoti sull'id del documento
      const uniqueResults = Array.from(new Set(combinedResults.map(item => item.id)))
        .map(id => combinedResults.find(item => item.id === id));

      return uniqueResults;
    } catch (error) {
      console.error("Error getting filtered collection: ", error);
      return [];
    }
  }

  //Salvataggio in FireStone

  async saveInCollection(collection: string, nameDoc: string | undefined, data: any): Promise<boolean> {
    
    try {
      const Collection = await this.firestore.collection(collection)
      if (!nameDoc) {
        Collection.add(data);
        this.getFilteredCollection(collection,[])
        return true
      } else {
        this.getFilteredCollection(collection,[])
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

  async updateInCollection(collection: string, nameDoc: any, data: Partial<any>): Promise<boolean> {
    try {

      this.firestore.collection(collection).doc(nameDoc).update(data);
      this.getFilteredCollection(collection)
      return true


    } catch (error) {

      return false
    }

  }

  // Eliminare documenti in FireStone
  async deleteDocuments(collection: string, conditions: Array<{ field: string, operator: string, value: any }>): Promise<boolean> {
    let query: any = this.firestore.collection(collection).ref;

    // Applica tutte le condizioni alla query
    conditions.forEach(condition => {
      query = query.where(condition.field, condition.operator, condition.value);
    });

    try {
      const querySnapshot = await query.get();
      // Elimina tutti i documenti che corrispondono alla query
      const deletePromises = querySnapshot.docs.map((doc: any) => doc.ref.delete());
      await Promise.all(deletePromises);
      this.getFilteredCollection(collection)
      return true
    } catch (error) {
      console.error('Error deleting documents:', error);
      return false
    }
  }
  // Caricamento dell'immagine in Firebase Storage

  async uploadImage(filePath: Blob, fileName: string, contentType: string): Promise<string> {
    const fileRef = this.storage.ref(fileName);
    let metaData = {
      contentType: contentType
    }

    const task = this.storage.upload(fileName, filePath, metaData);

    try {
      await task;  // Assicurati che l'upload sia completato prima di ottenere l'URL
      let downloadURL = await lastValueFrom(fileRef.getDownloadURL())

      return downloadURL;
    } catch (error) {
      throw new Error('Errore durante il caricamento dell\'immagine: ' + error);
    }
  }
}


