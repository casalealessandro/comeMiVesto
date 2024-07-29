import { Component, ElementRef, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AnagraficaService } from 'src/app/service/anagrafica-service';

@Component({
  selector: 'app-add-outfit',
  templateUrl: './add-outfit.page.html',
  styleUrls: ['./add-outfit.page.scss'],
})
export class AddOutfitPage  {
  @ViewChild('imageElement', { static: false }) imageElement: ElementRef | undefined;
  
  image: string | undefined;
  tags: any[] = [];
  title: string = '';
  description: string = '';
  showTag:boolean=false
  constructor(
    
    private anagraficaService: AnagraficaService
  ) {

    this.captureImage()
  }

  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.image = image.dataUrl;
  }

  addTag(event:any) {
    
    const name = prompt('Enter tag name:');
    const link = prompt('Enter Link name:');


    const imageElement = this.imageElement!.nativeElement;;
    const rect = imageElement.getBoundingClientRect();
    // Calcola la posizione relativa al contenitore dell'immagine
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;

    this.tags.push({ name, x, y, link });
  }

  async saveOutfit() {

    
   
      const outfit = {
        imageUrl: this.image,
        title: this.title,
        description: this.description,
        tags: this.tags,
        userId: '0001'
      };

      //this.anagraficaService
      //await addDoc(collection(this.firestore, 'outfits'), outfit);
      //this.router.navigate(['/home']);
    
  }
}
