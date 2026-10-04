import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FirebaseService } from 'src/app/service/firebase.service';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ModalFormComponent } from 'src/app/components/modal-form/modal-form.component';
import { ApiRequestError, AppService, ProductIdentificationResult, ProductUrlMetadata } from 'src/app/service/app-service';
import { categoryCloth, outfitCategories, Tag, wardrobesItem } from 'src/app/service/interface/outfit-all-interface';
import { ProdottiOnlinePage } from '../prodotti-online/prodotti-online.page';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { BarcodeFormat, BarcodeScanner, GoogleBarcodeScannerModuleInstallState } from '@capacitor-mlkit/barcode-scanning';
import { firstValueFrom, Observable } from 'rxjs';
import { UserProfile } from 'firebase/auth';
import { UserService } from 'src/app/service/user.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-my-wardrobes',
  templateUrl: './my-wardrobes.page.html',
  styleUrls: ['./my-wardrobes.page.scss'],
})
export class MyWardrobesPage implements OnInit {

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  @Input() showheader: boolean = false;

  [x: string]: any;
  wardrobesItems = this.appService.resultsSignal; // Utilizza signal per rendere reattivo l'array
  userWardrobes$!: Observable<wardrobesItem[]>;
  userWardrobes: any[] = []; // Array per gli outfit filtrati
  wardrobesGrupped: any = []
  userID: string = ''
  groupedItems: any = {};
  categoryCloth: outfitCategories[] = [];
  subCategoryCloth: outfitCategories[] = [];
  openModal: any = null
  isLoading: boolean = true;
  private isAddClothModalOpen = false;
  private isSearchClothModalOpen = false;
  private isProductLookupInProgress = false;
  private wardrobeDeletionsInProgress = new Set<string>();
  
  constructor(
    private appService: AppService,
    private firebase: FirebaseService,
    private modalController: ModalController,
    private userProfileService: UserService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {


    this.firebase.authState.subscribe(async user => {
      if (!user) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;
      try {
        console.log('user', user)
        this.userID = user.uid;

        this.categoryCloth = await this.appService.getData('outfitCategories', '')
        this.userWardrobes$ = this.userProfileService.getUserWardrobes();

        await this.groupItemsByCategory();

        this.openModal = await this.modalController.getTop();
      } finally {
        this.isLoading = false;
      }
    });
  }

  async groupItemsByCategory(): Promise<void> {

    let filter = [{
      field: 'userId',
      operator: '==',
      value: this.userID
    }]

    const dataR = await firstValueFrom(this.userWardrobes$);

    this.wardrobesGrupped = this.categoryCloth;

    const groupedItems = dataR.reduce((result: any[], item: wardrobesItem) => {
      const category = item.outfitCategory;

      // Filtrare la categoria corrispondente dal tuo array `categoryCloth`
      const filter = this.categoryCloth.find(ress => ress.id == category);
      const subCategores = this.categoryCloth.filter(res => res.parentCategory == category);

      // Trova l'oggetto della categoria esistente o crea un nuovo oggetto
      let categoryObject = result.find(cat => cat.wardrobesCategory === (filter ? filter.categoryName : '-'));

      if (!categoryObject) {
        categoryObject = {
          wardrobesCategory: filter ? filter.categoryName : '-',
          outfitCategoryID: filter?.id,
          wardrobesSubCategory: subCategores.map(reM => reM.categoryName).join(','),
          items: []
        };
        result.push(categoryObject);
      }

      // Aggiungere l'outfit alla categoria corretta
      categoryObject.items.push(item);

      return result;
    }, []);

    this.wardrobesItems.set(groupedItems); // Aggiorna il segnale con il nuovo array
    this.userWardrobes = [...groupedItems]
  }


  objectKeys(obj: any): string[] {
    let key = Object.keys(obj);

    return Object.keys(obj);
  }

  async deleteItemWadro(item: any) {
    const itemId = String(item.id);
    if (this.wardrobeDeletionsInProgress.has(itemId)) return;
    this.wardrobeDeletionsInProgress.add(itemId);
    try {
      const alert = await this.alertController.create({
      header: 'Rimuovi prodotto',
      message: item?.name
        ? `Vuoi rimuovere "${item.name}" dal tuo armadio?`
        : 'Vuoi rimuovere questo prodotto dal tuo armadio?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { text: 'Rimuovi', role: 'confirm' }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') {
        return;
    }

    const res = await this.appService.deleteWardrobe(String(item.id));
    if (res) {
        await this.groupItemsByCategory();
      }
    } finally {
      this.wardrobeDeletionsInProgress.delete(itemId);
    }
  }

  async scanProductCode() {
    if (this.isProductLookupInProgress) return;

    if (!Capacitor.isNativePlatform()) {
      await this.presentProductAlert('Scanner non disponibile', 'La scansione del codice è disponibile dall’app mobile.');
      return;
    }

    this.isProductLookupInProgress = true;
    try {
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        await this.presentProductAlert('Scanner non disponibile', 'Questo dispositivo non supporta la scansione dei codici.');
        return;
      }

      if (Capacitor.getPlatform() === 'ios') {
        const permission = await BarcodeScanner.checkPermissions();
        if (permission.camera !== 'granted') {
          const requested = await BarcodeScanner.requestPermissions();
          if (requested.camera !== 'granted') {
            await this.presentProductAlert('Fotocamera non disponibile', 'Abilita l’accesso alla fotocamera per scansionare il prodotto.');
            return;
          }
        }
      }

      if (Capacitor.getPlatform() === 'android' && !(await this.ensureAndroidScannerModule())) {
        await this.presentProductAlert('Scanner non disponibile', 'Non è stato possibile preparare lo scanner. Riprova tra poco.');
        return;
      }

      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Ean8, BarcodeFormat.Ean13, BarcodeFormat.UpcA, BarcodeFormat.UpcE, BarcodeFormat.QrCode],
        autoZoom: true
      });
      const barcode = result.barcodes?.[0];
      if (!barcode) return;

      const value = (barcode.urlBookmark?.url || barcode.rawValue || barcode.displayValue || '').trim();
      if (!value) {
        await this.presentProductAlert('Codice non leggibile', 'Non è stato possibile leggere il contenuto del codice.');
        return;
      }

      if (/^https?:\/\//i.test(value)) {
        await this.resolveProductUrl(value);
        return;
      }

      await this.lookupProductByGtin(value);
    } catch {
      await this.presentProductAlert('Scansione non riuscita', 'Non è stato possibile completare la scansione. Riprova.');
    } finally {
      this.isProductLookupInProgress = false;
    }
  }

  async addProductFromLink() {
    if (this.isProductLookupInProgress) return;

    const alert = await this.alertController.create({
      header: 'Aggiungi da link',
      message: 'Incolla il link della pagina prodotto.',
      inputs: [
        {
          name: 'url',
          type: 'url',
          placeholder: 'https://...'
        }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { text: 'Continua', role: 'confirm' }
      ]
    });

    await alert.present();
    const { role, data } = await alert.onDidDismiss();
    if (role !== 'confirm') return;

    const url = String(data?.values?.url || '').trim();
    if (!/^https?:\/\//i.test(url)) {
      await this.presentProductAlert('Link non valido', 'Inserisci un link che inizi con http:// o https://.');
      return;
    }

    this.isProductLookupInProgress = true;
    try {
      await this.resolveProductUrl(url);
    } finally {
      this.isProductLookupInProgress = false;
    }
  }

  private async lookupProductByGtin(gtin: string) {
    const loading = await this.loadingController.create({ message: 'Ricerca prodotto...' });
    await loading.present();

    let product: ProductIdentificationResult | null = null;
    let fallbackToManual = false;
    try {
      product = await this.appService.getOutfitProductByGtin(gtin);
    } catch (error) {
      if (error instanceof ApiRequestError && (error.status === 400 || error.status === 404)) {
        fallbackToManual = true;
      } else {
        await this.presentProductAlert('Ricerca non riuscita', 'Non è stato possibile cercare il prodotto. Riprova.');
      }
    } finally {
      await loading.dismiss();
    }

    if (product) {
      await this.addClothModal(this.productIdentificationPrefill(product));
    } else if (fallbackToManual) {
      await this.offerManualProduct('Prodotto non trovato', 'Non abbiamo trovato questo codice. Puoi inserire il prodotto manualmente.');
    }
  }

  private async resolveProductUrl(url: string) {
    const loading = await this.loadingController.create({ message: 'Recupero dati prodotto...' });
    await loading.present();

    let metadata: ProductUrlMetadata | null = null;
    let fallbackToManual = false;
    try {
      metadata = await this.appService.resolveOutfitProductUrl(url);
    } catch (error) {
      if (error instanceof ApiRequestError && [400, 404, 502].includes(error.status)) {
        fallbackToManual = true;
      } else {
        await this.presentProductAlert('Recupero non riuscito', 'Non è stato possibile leggere i dati del prodotto. Riprova.');
      }
    } finally {
      await loading.dismiss();
    }

    if (metadata) {
      await this.addClothModal(this.productUrlPrefill(metadata));
    } else if (fallbackToManual) {
      await this.offerManualProduct(
        'Dati non disponibili',
        'Non siamo riusciti a compilare automaticamente il prodotto. Puoi continuare manualmente mantenendo il link.',
        { link: url }
      );
    }
  }

  private productIdentificationPrefill(product: ProductIdentificationResult) {
    return {
      catalogProductId: product.catalogProductId || undefined,
      name: product.name,
      brend: product.brend || product.brand,
      outfitCategory: product.outfitCategory,
      outfitSubCategory: product.outfitSubCategory,
      color: product.color,
      prezzo: product.prezzo ?? product.price,
      price: product.price ?? product.prezzo,
      images: product.images,
      imageUrl: product.imageUrl,
      link: product.link
    };
  }

  private productUrlPrefill(metadata: ProductUrlMetadata) {
    const catalogProduct = metadata.catalogProduct;
    if (catalogProduct) {
      return {
        ...this.productIdentificationPrefill(catalogProduct),
        link: metadata.submittedUrl
      };
    }

    return {
      name: metadata.name,
      brend: metadata.brand,
      prezzo: metadata.price,
      price: metadata.price,
      images: metadata.images,
      imageUrl: metadata.imageUrl,
      link: metadata.submittedUrl
    };
  }

  private async ensureAndroidScannerModule(): Promise<boolean> {
    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (available) return true;

    const loading = await this.loadingController.create({ message: 'Preparazione scanner...' });
    await loading.present();

    try {
      return await new Promise<boolean>(async resolve => {
        let completed = false;
        let listener: any;
        let timeout: ReturnType<typeof setTimeout> | undefined;

        const finish = async (success: boolean) => {
          if (completed) return;
          completed = true;
          if (timeout) clearTimeout(timeout);
          if (listener) await listener.remove();
          resolve(success);
        };

        listener = await BarcodeScanner.addListener('googleBarcodeScannerModuleInstallProgress', event => {
          if (event.state === GoogleBarcodeScannerModuleInstallState.COMPLETED) void finish(true);
          if (event.state === GoogleBarcodeScannerModuleInstallState.CANCELED
            || event.state === GoogleBarcodeScannerModuleInstallState.FAILED) void finish(false);
        });

        timeout = setTimeout(() => void finish(false), 30000);
        try {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        } catch {
          await finish(false);
        }
      });
    } finally {
      await loading.dismiss();
    }
  }

  private async offerManualProduct(header: string, message: string, editData: any = {}) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { text: 'Inserisci manualmente', role: 'confirm' }
      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') await this.addClothModal(editData);
  }

  private async presentProductAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Ok']
    });
    await alert.present();
  }

  async addClothModal(editData: any = {}) {
    if (this.isAddClothModalOpen) return;
    this.isAddClothModalOpen = true;
    try {
      const modal = await this.modalController.create({
      component: ModalFormComponent,
      componentProps: {
        service: 'tagForm',
        title: 'Inserisci un nuovo prodotto',
        editData

      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) {
      return
    }

    const productData = { ...editData, ...data };
    const categoryID = productData.outfitCategory;
    const subCategoryID = productData.outfitSubCategory;
    const link = !productData.link ? '#' : productData.link;

    const prezzo = productData.prezzo ?? productData.price ?? null;
    let images = !productData.images ? "" : productData.images
    images = productData.imageUrl ? productData.imageUrl : images


    const id = this.generateGUID();
    let saveData = {
      brend: productData.brend,
      images: Array.isArray(images) ? images : images ? [images] : [],
      name: productData.name,
      outfitCategory: categoryID,
      outfitSubCategory: subCategoryID,
      color: productData.color,
      prezzo: prezzo === null || prezzo === '' ? null : Number(prezzo),
      link: link,
      ...(productData.catalogProductId ? { catalogProductId: productData.catalogProductId } : {}),
    }

    let resSave = await this.appService.createWardrobe(saveData)
    if (resSave) {

      this.groupItemsByCategory();

      //Mando i dati on uscita
      const modal = await this.modalController.getTop();
      if (modal) {
        this.modalController.dismiss(saveData)
      } else {
        this.selectedItem.emit(saveData);
      }



    }
      return data
    } finally {
      this.isAddClothModalOpen = false;
    }
  }

  async searchClothModal() {
    if (this.isSearchClothModalOpen) return;
    this.isSearchClothModalOpen = true;
    try {
      const parentModal = this.showheader ? await this.modalController.getTop() : null;
      const modal = await this.modalController.create({
      component: ProdottiOnlinePage,
      componentProps: {
        showHeader: true,

      }

    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role !== 'selected' || !data) {
      return
    }

    await this.groupItemsByCategory();
    if (parentModal) {
      await parentModal.dismiss(data);
    } else {
      this.selectedItem.emit(data);
    }
      return data
    } finally {
      this.isSearchClothModalOpen = false;
    }
  }

  generateGUID(): any {
    function s4(): any {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  // Funzione link allo store
  async buyToStore(prod: any) {
    let link = !prod.link ? '#' : prod.link

    if (link != '#') {
      await Browser.open({ url: link });
    }
  }
  async selectItem(ev: any) {
    const keyEvt = ev.name
    const item = ev.data;
    switch (keyEvt) {
      case 'removeProduct':
        this.deleteItemWadro(item)
        break;

      default:
        const modal = await this.modalController.getTop();
        if (modal) {
          this.modalController.dismiss(item)
        } else {
          console.log('selectItem', item);
          this.selectedItem.emit(item)
        }
        break;
    }
    // Controlla se la pagina è aperta in un modale


  }

  dismissModal(evet: any) {
    this.modalController.dismiss()
  }

  navUserProfile() {
    this.router.navigate(['/tabs/my-profile'])
  }
}
