import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AppService, OutfitBrand, OutfitColor } from 'src/app/service/app-service';
import { OutfitStyle, OutfitStyleGender } from 'src/app/service/interface/outfit-style-interface';
import { AgeRange } from 'src/app/service/interface/user-interface';
import { UserService } from 'src/app/service/user.service';

interface PreferenceOption {
  id: string;
  value: string;
  parent: null;
}

interface AgeRangeOption {
  id: AgeRange;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-preferences-onboarding',
  templateUrl: './preferences-onboarding.component.html',
  styleUrls: ['./preferences-onboarding.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PreferencesOnboardingComponent implements OnInit {
  currentStep = 1;
  readonly totalSteps = 4;
  saving = false;
  stylesLoading = true;
  stylesLoadError = false;
  colorsLoading = true;
  colorsLoadError = false;
  brandsLoading = true;
  brandsLoadError = false;
  brandSearchQuery = '';
  selectedAgeRange: AgeRange | null = null;

  readonly ageRangeOptions: AgeRangeOption[] = [
    { id: 'under_18', label: 'Meno di 18' },
    { id: '18_24', label: '18 - 24' },
    { id: '25_34', label: '25 - 34' },
    { id: '35_44', label: '35 - 44' },
    { id: '45_54', label: '45 - 54' },
    { id: '55_64', label: '55 - 64' },
    { id: '65_plus', label: '65+' },
  ];

  selectedStyles = new Set<string>();
  selectedColors = new Set<string>();
  selectedBrands = new Set<string>();

  styleOptions: OutfitStyle[] = [];
  colorOptions: OutfitColor[] = [];
  brandOptions: OutfitBrand[] = [];

  get filteredBrandOptions(): OutfitBrand[] {
    const query = this.brandSearchQuery.trim().toLocaleLowerCase();
    if (!query) return this.brandOptions;

    return this.brandOptions.filter(brand => brand.value.toLocaleLowerCase().includes(query));
  }

  constructor(
    private userService: UserService,
    private appService: AppService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {}

  ngOnInit(): void {
    const preference = this.userService.gUserPreference()();
    this.selectedAgeRange = preference?.ageRange ?? this.ageToRange(preference?.age);
    this.selectedStyles = new Set(preference?.style ?? []);
    this.selectedColors = new Set(preference?.color ?? []);
    this.selectedBrands = new Set(preference?.brend ?? []);
    this.loadStyles();
    this.loadColors();
    this.loadBrands();
  }

  get canContinue(): boolean {
    if (this.currentStep === 1) return this.selectedAgeRange !== null;
    if (this.currentStep === 2) return this.selectedStyles.size > 0;
    if (this.currentStep === 3) return this.selectedColors.size > 0;
    return true;
  }

  selectAgeRange(ageRange: AgeRange): void {
    this.selectedAgeRange = ageRange;
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.canContinue) this.currentStep++;
  }

  toggleStyle(id: string): void {
    this.toggleSelection(this.selectedStyles, id);
  }

  toggleColor(id: string): void {
    this.toggleSelection(this.selectedColors, id);
  }

  toggleBrand(id: string): void {
    this.toggleSelection(this.selectedBrands, id);
  }

  isSelected(values: Set<string>, id: string): boolean {
    return values.has(id);
  }

  getStyleImage(style: OutfitStyle): string | null {
    const gender = this.userGender;
    if (!gender) return null;

    const image = style.images?.[gender];
    if (!image?.imageBase64 || !image.imageMimeType) return null;

    return `data:${image.imageMimeType};base64,${image.imageBase64}`;
  }

  async skip(): Promise<void> {
    await this.modalController.dismiss(null, 'skip');
  }

  async save(): Promise<void> {
    if (this.saving || !this.selectedAgeRange) return;

    this.saving = true;
    const saved = await this.userService.setUserPreference({
      uid: this.userService.gUserProfile()()?.uid ?? '',
      ageRange: this.selectedAgeRange,
      color: Array.from(this.selectedColors),
      brend: Array.from(this.selectedBrands),
      style: Array.from(this.selectedStyles),
    });
    this.saving = false;

    if (!saved) {
      const alert = await this.alertController.create({
        header: 'Preferenze non salvate',
        message: 'Non è stato possibile salvare le preferenze. Riprova.',
        buttons: ['Ok'],
      });
      await alert.present();
      return;
    }

    await this.modalController.dismiss({ saved: true }, 'complete');
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private ageToRange(age?: number | null): AgeRange | null {
    if (!Number.isInteger(age)) return null;
    if ((age as number) < 18) return 'under_18';
    if ((age as number) <= 24) return '18_24';
    if ((age as number) <= 34) return '25_34';
    if ((age as number) <= 44) return '35_44';
    if ((age as number) <= 54) return '45_54';
    if ((age as number) <= 64) return '55_64';
    return '65_plus';
  }

  private toggleSelection(values: Set<string>, id: string): void {
    const updated = new Set(values);
    updated.has(id) ? updated.delete(id) : updated.add(id);

    if (values === this.selectedStyles) this.selectedStyles = updated;
    if (values === this.selectedColors) this.selectedColors = updated;
    if (values === this.selectedBrands) this.selectedBrands = updated;
  }

  private loadStyles(): void {
    this.stylesLoading = true;
    this.stylesLoadError = false;
    this.appService.getOutfitStyles().pipe(
      finalize(() => this.stylesLoading = false),
    ).subscribe({
      next: styles => {
        const gender = this.userGender;
        this.styleOptions = gender
          ? styles.filter(style => style.gender.includes(gender))
          : [];
        this.stylesLoadError = this.styleOptions.length === 0;
      },
      error: () => {
        this.styleOptions = [];
        this.stylesLoadError = true;
      },
    });
  }

  private loadColors(): void {
    this.colorsLoading = true;
    this.colorsLoadError = false;
    this.appService.getOutfitColors().pipe(
      finalize(() => this.colorsLoading = false),
    ).subscribe({
      next: colors => {
        this.colorOptions = colors;
        this.colorsLoadError = colors.length === 0;
      },
      error: () => {
        this.colorOptions = [];
        this.colorsLoadError = true;
      },
    });
  }

  private loadBrands(): void {
    this.brandsLoading = true;
    this.brandsLoadError = false;
    this.appService.getOutfitBrands().pipe(
      finalize(() => this.brandsLoading = false),
    ).subscribe({
      next: brands => {
        this.brandOptions = brands;
        this.brandsLoadError = brands.length === 0;
      },
      error: () => {
        this.brandOptions = [];
        this.brandsLoadError = true;
      },
    });
  }

  private get userGender(): OutfitStyleGender | null {
    const gender = this.userService.gUserProfile()()?.gender;
    return gender === 'U' || gender === 'D' ? gender : null;
  }
}
