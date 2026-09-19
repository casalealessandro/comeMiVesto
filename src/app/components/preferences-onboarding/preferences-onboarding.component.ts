import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { brend, colors, style } from 'src/app/service/interface/outfit-all-interface';
import { UserService } from 'src/app/service/user.service';

interface PreferenceOption {
  id: string;
  value: string;
  parent: null;
}

interface StylePreferenceOption extends PreferenceOption {
  image: string;
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
  age?: number;
  saving = false;

  selectedStyles = new Set<string>();
  selectedColors = new Set<string>();
  selectedBrands = new Set<string>();

  private readonly styleImages: Record<string, string> = {
    C: 'casual.svg',
    B: 'business.svg',
    SP: 'sportivo.svg',
    SC: 'smart-casual.svg',
    E: 'elegante.svg',
    AT: 'alternativo.svg',
    FES: 'festival.svg',
    CL: 'classico.svg',
    TR: 'trendy.svg',
    SE: 'serata.svg',
  };

  styleOptions: StylePreferenceOption[] = style.map(item => ({
    ...item,
    image: 'assets/preferences/styles/' + (this.styleImages[item.id] ?? 'casual.svg'),
  }));
  colorOptions = colors;
  brandOptions = brend;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {}

  ngOnInit(): void {
    const preference = this.userService.gUserPreference()();
    this.age = Number.isInteger(preference?.age) ? preference?.age ?? undefined : undefined;
    this.selectedStyles = new Set(preference?.style ?? []);
    this.selectedColors = new Set(preference?.color ?? []);
    this.selectedBrands = new Set(preference?.brend ?? []);
  }

  get canContinue(): boolean {
    if (this.currentStep === 1) return Number.isInteger(this.age) && Number(this.age) >= 1 && Number(this.age) <= 120;
    if (this.currentStep === 2) return this.selectedStyles.size > 0;
    if (this.currentStep === 3) return this.selectedColors.size > 0;
    return true;
  }

  setAge(value: string | number | null | undefined): void {
    if (value === null || value === undefined || value === '') {
      this.age = undefined;
      return;
    }
    const parsed = Number(value);
    this.age = Number.isInteger(parsed) ? parsed : undefined;
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

  async skip(): Promise<void> {
    await this.modalController.dismiss(null, 'skip');
  }

  async save(): Promise<void> {
    if (this.saving) return;

    this.saving = true;
    const saved = await this.userService.setUserPreference({
      uid: this.userService.gUserProfile()()?.uid ?? '',
      age: this.age,
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

  trackById(_index: number, item: PreferenceOption): string {
    return item.id;
  }

  private toggleSelection(values: Set<string>, id: string): void {
    const updated = new Set(values);
    updated.has(id) ? updated.delete(id) : updated.add(id);

    if (values === this.selectedStyles) this.selectedStyles = updated;
    if (values === this.selectedColors) this.selectedColors = updated;
    if (values === this.selectedBrands) this.selectedBrands = updated;
  }
}
