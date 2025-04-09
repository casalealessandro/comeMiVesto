import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-dynamic-file-box',
  templateUrl: './dynamic-file-box.component.html',
  styleUrls: ['./dynamic-file-box.component.scss'],
})
export class DynamicFileBoxComponent implements AfterViewInit {
  @ViewChild('imageElement', { static: false }) imageElement:
    | ElementRef
    | undefined;

  @Output() eventFotoCaptured: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  @Input() image: any =
    'https://ionicframework.com/docs/img/demos/thumbnail.svg';
  @Input() enableNewImagecaptured: boolean = true;
  @Input() labelPlacement: any = 'stacked';

  @Input() maxWidth = 300; // Larghezza massima per i post verticali tipo Instagram
  @Input() maxHeight = 1350; // Altezza massima per i post verticali tipo Instagram

  imageLoading: boolean = true;
  blobImg: any;
  fileName: any;
  format: string = '';
  openFullScreen: boolean = false;
  base64String: string | undefined;

  constructor(private alert: AlertController) {}

  ngAfterViewInit(): void {
    if (this.imageElement) {
      this.imageElement.nativeElement.onload = (event: Event) => {
        setTimeout(() => {
          this.imageLoading = false; // Nasconde il loader
        }, 1500);
      };
      // Nel caso in cui si verifichi un errore nel caricamento dell'immagine
      this.imageElement.nativeElement.onerror = () => {
        this.imageLoading = false; // Nascondi il loader anche in caso di errore
      };
    }

    if (!this.imageElement) {
      this.imageLoading = false;
    }
  }

  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      width: this.maxWidth,
      promptLabelPhoto: 'Seleziona dalla galleria ',
      promptLabelPicture: 'Scatta una foto',
      promptLabelCancel: 'Cancella',
    });

    if (image && image.dataUrl) {
      // Aggiungi un controllo per verificare che image non sia undefined

      const resizedImage = await this.resizeImage(
        image.dataUrl,
        this.maxWidth,
        image.format
      );
      this.base64String = resizedImage.dataUrl;
      this.format = resizedImage.format;
      this.fileName = `${new Date().getTime()}.${this.format}`;
      const path = `${Directory.Data}/${this.fileName}`;
      let contentType = '';

      /* // Salvataggio dell'immagine nel filesystem
      await Filesystem.writeFile({
        path: path,
        data: this.blobImg,
        directory: Directory.Data,
      });
   */
      this.image = this.base64String;

      let eventToEmit = {
        img: this.image,
        imgName: this.fileName,
        contentType: contentType,
      };
      this.eventFotoCaptured.emit(eventToEmit);
    }
  }

  resizeImage(
    dataUrl: string,
    maxWidth: number,
    format: string
  ): Promise<{ dataUrl: string; format: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        let canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // Calcolo del ridimensionamento mantenendo il rapporto d'aspetto
        if (width > maxWidth) {
          const scaleFactor = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleFactor;

          width = maxWidth;
          height = img.height * scaleFactor;
        }

        ctx!.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL(`image/${format}`, 0.7);

        resolve({
          dataUrl: resizedDataUrl,
          format: resizedDataUrl.split(';')[0].split('/')[1],
        });
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
            },
          },
          {
            text: 'Si',
            handler: () => {
              this.image = undefined;

              resolve(true); // Risolvi la Promise con true
            },
          },
        ],
      });

      await alert.present();
    });
  }

  // Funzione per convertire dataURL (BASE64) in Blob m ora uso base64
  private dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }
}
