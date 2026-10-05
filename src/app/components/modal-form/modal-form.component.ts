import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { ApiRequestError, AppService, ProductUrlMetadata } from 'src/app/service/app-service';

@Component({
  standalone: false,
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
})
export class ModalFormComponent {
  @Input() service: any = null;
  @Input() title: string = '';
  @Input() editData: any = {};
  @Input() productQuickActions: boolean = false;

  @ViewChild(DynamicFormComponent) dynamicForm?: DynamicFormComponent;

  formVisible = true;
  importHint = '';
  private importedProductData: any = {};

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private appService: AppService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  dismiss() {
    this.modalController.dismiss();
  }

  applyData(event: any) {
    if (this.service === 'tagForm') {
      this.modalController.dismiss({
        ...this.editData,
        ...this.importedProductData,
        ...event
      });
      return;
    }

    this.modalController.dismiss(event);
  }

  async quickProductAction(action: 'store' | 'scan' | 'link') {
    if (action === 'link') {
      await this.importProductFromLink();
      return;
    }

    await this.modalController.dismiss({ action }, 'product-quick-action');
  }

  async functionalInputFormEvent(_event: any) {
    if (this.service !== 'tagForm') return;
    await this.importProductFromLink();
  }

  private async importProductFromLink() {
    const currentValues = this.dynamicForm?.form?.value || {};
    const currentLink = String(currentValues.link || this.editData?.link || '').trim();

    const alert = await this.alertController.create({
      header: 'Importa da link',
      message: 'Incolla il link della pagina prodotto. Recupereremo i dati disponibili senza salvare nulla finché non premi Salva.',
      inputs: [
        {
          name: 'url',
          type: 'url',
          value: currentLink,
          placeholder: 'https://...'
        }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        { text: 'Recupera dati', role: 'confirm' }
      ]
    });

    await alert.present();
    const { role, data } = await alert.onDidDismiss();
    if (role !== 'confirm') return;

    const url = String(data?.values?.url || '').trim();
    if (!/^https?:\/\//i.test(url)) {
      await this.presentAlert('Link non valido', 'Inserisci un link che inizi con http:// o https://.');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Recupero dati prodotto...' });
    await loading.present();

    try {
      const metadata = await this.appService.resolveOutfitProductUrl(url);
      const imported = await this.productUrlPrefill(metadata);
      const preservedValues = this.dynamicForm?.form?.value || {};

      this.importedProductData = {
        ...this.importedProductData,
        ...(metadata.catalogProduct?.catalogProductId
          ? { catalogProductId: metadata.catalogProduct.catalogProductId }
          : {})
      };

      this.editData = {
        ...this.editData,
        ...preservedValues,
        ...imported
      };

      this.formVisible = false;
      this.changeDetectorRef.detectChanges();
      this.formVisible = true;
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      const message = error instanceof ApiRequestError && [400, 404, 502].includes(error.status)
        ? 'Non siamo riusciti a recuperare automaticamente i dati. Puoi continuare a compilare la form manualmente.'
        : 'Non è stato possibile leggere i dati del prodotto. Riprova.';
      await this.presentAlert('Importazione non riuscita', message);
    } finally {
      await loading.dismiss();
    }
  }

  private async productUrlPrefill(metadata: ProductUrlMetadata): Promise<any> {
    const product = metadata.catalogProduct;

    if (product) {
      this.importHint = '';
      return {
        name: product.name,
        brend: product.brend || product.brand,
        outfitCategory: product.outfitCategory,
        outfitSubCategory: product.outfitSubCategory,
        color: product.color,
        prezzo: product.prezzo ?? product.price,
        price: product.price ?? product.prezzo,
        images: product.imageUrl || product.images?.[0] || '',
        imageUrl: product.imageUrl || product.images?.[0] || '',
        link: metadata.submittedUrl
      };
    }

    const canonicalBrand = await this.canonicalBrand(metadata.brand);
    this.importHint = metadata.brand && !canonicalBrand
      ? `Brand rilevato: ${metadata.brand}. Selezionalo dall’elenco se disponibile.`
      : '';

    return {
      name: metadata.name,
      ...(canonicalBrand ? { brend: canonicalBrand } : {}),
      prezzo: metadata.price,
      price: metadata.price,
      images: metadata.imageUrl || metadata.images?.[0] || '',
      imageUrl: metadata.imageUrl || metadata.images?.[0] || '',
      link: metadata.submittedUrl
    };
  }

  private async canonicalBrand(value: string): Promise<string> {
    const brand = this.normalizeOptionValue(value);
    if (!brand) return '';

    try {
      const brands = await firstValueFrom(this.appService.getOutfitBrands());
      const match = brands.find(option =>
        this.normalizeOptionValue(option.id) === brand
        || this.normalizeOptionValue(option.value) === brand
      );
      return match?.id || '';
    } catch {
      return '';
    }
  }

  private normalizeOptionValue(value: unknown): string {
    return typeof value === 'string'
      ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('it')
      : '';
  }

  private async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Ok']
    });
    await alert.present();
  }
}
