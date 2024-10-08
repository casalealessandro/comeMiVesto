import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Browser } from '@capacitor/browser';
import { Tag, outfit } from 'src/app/service/interface/outfit-all-interface';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { AlertController, ModalController } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { MyWardrobesPage } from '../my-wardrobes/my-wardrobes.page';

@Component({
  selector: 'app-foto-outfit',
  templateUrl: './foto-outfit.page.html',
  styleUrls: ['./foto-outfit.page.scss'],
  
})
export class FotoOutfitPage implements OnInit {
  @ViewChild('imageElement', { static: false }) imageElement: ElementRef | undefined;
  @Output() eventFotoCaptured: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  @Output() eventImageTags: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  @Output() eventBeforeFotoCaptured: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  @Output() eventImageShowFull: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;

  @Input() image!: undefined | string;
  //Abilita l'inserimento dei tag nell'immagine catturata
  @Input() enableSetTagsImage: boolean = true;
  @Input() enableNewImagecaptured: boolean = true;
  @Input() tags!: Tag[];

  tagStyle: any = [];

  showTag: boolean = false
  imageLoading: boolean = true
  tagToggleButton: any = {};
  blobImg: any;
  fileName: any;
  format: string = '';
  openFullScreen:boolean=false
  
  constructor(private modalController: ModalController,private alert:AlertController) { }


  ngOnInit(): void {
    if (this.enableNewImagecaptured) {
      //this.captureImage()
    }
  }

  ngAfterViewInit(): void {
    
    if (this.imageElement) {

      this.imageElement.nativeElement.onload = (event: Event) => {
        setTimeout(() => {
          this.onImageLoad(event);
        },1500);

      };
      // Nel caso in cui si verifichi un errore nel caricamento dell'immagine
      this.imageElement.nativeElement.onerror = () => {
        this.imageLoading = false;  // Nascondi il loader anche in caso di errore
      };
    }
    //Nascondi loader se sto in inserimento
    if (this.enableNewImagecaptured) {
      this.imageLoading = false;
    }

     
  }

  onImageLoad(event: Event): void {
    if (this.tags.length > 0) {
      const image = this.imageElement?.nativeElement as HTMLElement;
      const rect = image.getBoundingClientRect();
      this.setDisplayTag(rect)
    }

    this.imageLoading = false;  // Nasconde il loader
  }


  async captureImage() {
    if (this.tags.length > 0 && typeof this.image !== 'undefined') {
      let respo = await this.confirmChangeFoto();
      if (!respo) {
        return;
      }
    }
  
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelPhoto: 'Seleziona dalla galleria ',
      promptLabelPicture: 'Scatta una foto',
      promptLabelCancel: 'Cancella',
    });
  
    if (image && image.dataUrl) {  // Aggiungi un controllo per verificare che dataUrl non sia undefined
      const maxWidth = 1080; // Larghezza massima per i post verticali tipo Instagram
      const maxHeight = 1350; // Altezza massima per i post verticali tipo Instagram
  
      // Ridimensionamento dell'immagine
      const resizedImage = await this.resizeImage(image.dataUrl, maxWidth, maxHeight);
  
      this.blobImg = resizedImage.dataUrl;
      this.format = resizedImage.format;
      this.fileName = `${new Date().getTime()}.${this.format}`;
      const path = `${Directory.Data}/${this.fileName}`;
  
      const contentType = resizedImage.dataUrl.substring(resizedImage.dataUrl.indexOf(":") + 1, resizedImage.dataUrl.indexOf(";"));
  
      /* // Salvataggio dell'immagine nel filesystem
      await Filesystem.writeFile({
        path: path,
        data: this.blobImg,
        directory: Directory.Data,
      });
      */
      this.image = resizedImage.dataUrl;
  
      let eventToEmit = {
        img: this.dataURLtoBlob(this.image),
        imgName: this.fileName,
        contentType: contentType,
      };
      this.eventFotoCaptured.emit(eventToEmit);
    }
  }
  
  
  resizeImage(dataUrl: string, maxWidth: number, maxHeight: number): Promise<{ dataUrl: string; format: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = dataUrl;
  
      img.onload = () => {
        let canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        let width = img.width;
        let height = img.height;
  
        // Calcolo del ridimensionamento mantenendo il rapporto d'aspetto
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);
  
          width *= bestRatio;
          height *= bestRatio;
        }
  
        canvas.width = width;
        canvas.height = height;
  
        ctx!.drawImage(img, 0, 0, width, height);
        
        const resizedDataUrl = canvas.toDataURL();
        resolve({ dataUrl: resizedDataUrl, format: resizedDataUrl.split(";")[0].split("/")[1] });
      };
  
      img.onerror = (err) => {
        reject(err);
      };
    });
  }
  

  async confirmChangeFoto(): Promise<boolean> {
    return new Promise(async (resolve) => {
        const alert = await this.alert.create({
            header: 'Attenzione!',
            subHeader: `Sei sicuro di voler sostituire la foto di questo outfit?`,
            message: `Procedendo perderai anche tutti i tag associati e la priorità acquisita nell'elenco`,
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        resolve(false); // Risolvi la Promise con false
                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        this.tags = [];
                        this.image = undefined;
                        let eventtoEmit = {
                          tags: this.tags
                        }
                        this.eventImageTags.emit(eventtoEmit);

                        resolve(true); // Risolvi la Promise con true
                    }
                }
            ]
        });

        await alert.present();
    });
}

  async addTag(event: any) {
    
    if (!this.enableSetTagsImage) {
      
      this.eventImageShowFull.emit()
      return
    }

    let name = ''
    let link = ''

    let result: any = await this.openModal();
    if (Object.keys(result).length > 0) {
      const image = this.imageElement?.nativeElement as HTMLElement;
      const rect = image.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      let link = !result.link ? '#' : result.link
      let brend = !result.brend ? null : result.brend
      let prezzo = !result.prezzo ? null : result.prezzo
      let id = !result.id ? result.name.replace(' ', '_') : result.id;
      let images = !result.images ? '' : result.images
      
      this.tags.push(
        {
          id: id,
          name: result.name,
          x: x,
          y: y,
          link: link,
          color:result.color,
          brend:brend,
          prezzo:prezzo,
          price:prezzo,
          images:images,
          outfitCategory: result.outfitCategory,
          outfitSubCategory: result.outfitSubCategory

        }

      );
      this.setDisplayTag(rect)
      this.setDisplayButtonTag(rect);

      let eventtoEmit = {
        tags: this.tags
      }
      this.eventImageTags.emit(eventtoEmit)
    }
    return

  }

  setDisplayTag(rect: DOMRect) {
    this.tags.forEach(tag => {
      this.tagStyle[tag.id] = {

        left: `${tag.x * rect.width}px`,
        top: `${tag.y * rect.height}px`
      }
    })


  }

  toggleTags() {
    this.showTag = !this.showTag;
  }

  setDisplayButtonTag(rect: DOMRect) {

    const bottomOffset = 0.1 * rect.height;  // Offset dal fondo (10% dell'altezza dell'immagine)
    const rightOffset = 0.05 * rect.width;    // Offset da destra (5% della larghezza dell'immagine)

    this.tagToggleButton = {
      bottom: `${bottomOffset}px`,
      right: `${rightOffset}px`,
      position: 'absolute',
      zIndex: 10
    };
  }

  async openModal(): Promise<{}> {
    const modal = await this.modalController.create({
      component: MyWardrobesPage,
      componentProps: {
       

      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log('Modal data:', data);

    return data
  }

  async openItmClothing(tag: Tag) {

    let link = !tag.link ? '#' : tag.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }
  
  /**utility**/

  // Funzione per convertire dataURL (BASE64) in Blob
  private dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }
 
  onImageError(event: any) {

    event.target.src = 'assets/images/fallback-image.jpg';

  }

  closeModalFullScreen(){
    this.openFullScreen = false;
  }

  
}
