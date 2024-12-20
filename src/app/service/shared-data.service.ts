import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface sharedData {
  componentName: string; // Nome del componente
  data: any; // Dati da passare
}

@Injectable({
  providedIn: 'root'
})


export class SharedDataService {

  private sharedData = new Subject<sharedData[]>();  // Dati che vuoi passare all'overlay


  // Observable per recuperare i dati
  staredData$ = this.sharedData.asObservable();


  data = signal<sharedData[]>([]);


  getData(componentName?: string): any {
    if (componentName) {
      const dataArray = this.data().filter(d => d.componentName === componentName);
      return dataArray

    }

    return this.data()

  }

  setData(newData: sharedData) {

    if (this.data().length == 0) {
      this.data.set([newData])
      this.sharedData.next(this.data()); // Passa i dati
      return;
    }

    this.data.update((currentData) => {
      const index = currentData.findIndex(d => d.componentName === newData.componentName);
      if (index < 0) {
        currentData.push(newData);
      } else {
        currentData[index] = newData;
      }
      return currentData;
    });


    this.sharedData.next(this.data()); // Passa i dati
  }

  clearData(componentName?: string): any {
    if (componentName) {
  
      this.data.update((currentData) => {
        const index = currentData.findIndex(d => d.componentName === componentName);
        currentData.slice(index, currentData.length);
        return currentData;
      });

    }
    this.sharedData.next(this.data()); // Passa i dati 
    //return this.data()

  }


}
