import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { Tag, outfit } from 'src/app/service/interface/outfit-all-interface';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { ModalController } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-foto-outfit',
  templateUrl: './foto-outfit.page.html',
  styleUrls: ['./foto-outfit.page.scss'],
})
export class FotoOutfitPage implements OnInit {
  @ViewChild('imageElement', { static: true }) imageElement: ElementRef | undefined;
  @Output() eventFotoCaptured: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  @Output() eventImageTags: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;

  @Input() image!: undefined | string;
  //Abilita l'inserimento dei tag nell'immagine catturata
  @Input() enableSetTagsImage: boolean = true;
  @Input() enableNewImagecaptured: boolean = true;
  @Input() tags: Tag[]=[];
  
  tagStyle:any=[];

  

  showTag: boolean = false
  tagToggleButton: any={};
  blobImg: any;
  fileName: any;
  constructor(private modalController: ModalController,) { }

  

  ngOnInit(): void{
    if(this.enableNewImagecaptured){
      this.captureImage()
    }
    
  }

  ngAfterViewInit(): void {
    if (this.imageElement) {
      this.imageElement.nativeElement.onload = (event: Event) => {
        this.onImageLoad(event);
      };
    }
  }

  onImageLoad(event: Event): void {
    if(this.tags.length>0){
      const image = this.imageElement?.nativeElement as HTMLElement;
      const rect = image.getBoundingClientRect();
      this.setDisplayTag(rect)
    }
  }


  async captureImage() {
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    if (image) {
     
      this.blobImg =  image.dataUrl
      this.fileName = new Date().getTime() + '.jpg';
      const path = `${Directory.Data}/${this.fileName }`;

      // Salvataggio dell'immagine nel filesystem
      await Filesystem.writeFile({
        path: path,
        data:  this.blobImg,
        directory: Directory.Data
      });
      
      this.image = !image.dataUrl ? '' : image.dataUrl;
      let eventToEmit = {
        img:this.image,
        imgName:this.fileName
      }
      this.eventFotoCaptured.emit(eventToEmit)
    }
    
  }

  async addTag(event:any) {
    
    if(!this.enableSetTagsImage){
      
      return
    }
    
    let name = ''
    let link =  ''
   
    let result:any  = await this.openModal();
    if(Object.keys(result).length>0){
      const image = this.imageElement?.nativeElement as HTMLElement;
      const rect = image.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      let id =  result.name.replace(' ','_')
      this.tags.push(
        { 
          id:id,
          name:result.name,
          x:x,
          y:y, 
          link:result.link 
        }
        
      );
      this.setDisplayTag(rect)
      this.setDisplayButtonTag(rect);

      let eventtoEmit ={
        tags:this.tags
      }
      this.eventImageTags.emit(eventtoEmit)
    }
    return
    
  }

  setDisplayTag(rect:DOMRect){
    this.tags.forEach(tag=>{
      this.tagStyle[tag.id]={
        
        left: `${tag.x * rect.width}px`,
        top:`${tag.y * rect.height}px`
      }
    })

    
  }

  toggleTags(){
    this.showTag = !this.showTag;
  }

  setDisplayButtonTag(rect:DOMRect){

    const bottomOffset = 0.1 * rect.height;  // Offset dal fondo (10% dell'altezza dell'immagine)
    const rightOffset = 0.05 * rect.width;    // Offset da destra (5% della larghezza dell'immagine)

    this.tagToggleButton = {
      bottom: `${bottomOffset}px`,
      right: `${rightOffset}px`,
      position: 'absolute',
      zIndex: 10
    };
  }

  async openModal():Promise<{}> {
    const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'tagForm',
        
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('Modal data:', data);

    return data
  }


  onImageError(event:any){
    
      event.target.src = 'assets/images/fallback-image.jpg';
   
  }
}
