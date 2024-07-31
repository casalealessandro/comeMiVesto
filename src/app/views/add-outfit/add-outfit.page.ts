import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AnagraficaService } from 'src/app/service/anagrafica-service';
import { outfit, Tag } from 'src/app/service/interface/outfit-all-interface';

import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-add-outfit',
  templateUrl: './add-outfit.page.html',
  styleUrls: ['./add-outfit.page.scss'],
})
export class AddOutfitPage  {
  
  @ViewChild('imageContainer', { static: false }) imageContainer: ElementRef | undefined;
  
  image: string= '';
  tags: Tag[]=[];
  outfit!: outfit;
  title: string = '';
  description: string = '';
  showTag:boolean=false
  gender!: "man" | "woman";
  style!: "casual" | "elegant" | "sporty" | "formal";
  season!: "winter" | "spring" | "summer" | "autumn";
 
  color: any;
  imgCapt: string='';
  imgFileName: string='';
  
  constructor(
    
    private anagraficaService: AnagraficaService,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {

   
  }

  setImageCaptured(event:any){
    this.image =event.img;
    this.imgFileName = event.imgName;
  }

  setImageTagSet(event:any){
    this.tags = event.tags as Tag[]
  }
  
  saveOutfit(event:any) {
    
    this.title = event.title;
    this.color = event.color;
    this.description = event.description;
    this.gender = event.gender;
    this.season = event.season;
    this.style = event.style;

    this.confirmOutfit()
    
  }

  async confirmOutfit(){
      let imageUrl = null
      if(!this.title){
        return
      }
      if(!this.image){
        return
      }else{
        imageUrl = await this.anagraficaService.uploadImage(this.image, this.imgFileName);

      }
      const user = await this.afAuth.currentUser;
      if (user) {
        this.outfit = {
          title:this.title,
          description:this.description,
          imageUrl: imageUrl,
          tags: this.tags,
          gender: this.gender,
          style: this.style,
          season: this.season,
          color:this.color,
          userId: user.uid
        };
      }
      const nameDoc = `outfit_${user!.uid}`
      let res = await this.anagraficaService.saveInCollection(nameDoc,this.outfit )
      
      if(res){
        this.router.navigate(['/myoutfit']);
      }
     
    
  }

  /**utility**/
  // Helper per convertire il blob in base64
  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
}
