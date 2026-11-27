import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

/**
 * Real Ionic modal used after a guest has explored outfits.
 * The containing page decides when it appears and handles the chosen action.
 */
@Component({
  standalone: true,
  selector: 'app-guest-save-dialog',
  imports: [CommonModule, IonicModule],
  templateUrl: './guest-save-dialog.component.html',
  styleUrls: ['./guest-save-dialog.component.scss'],
})
export class GuestSaveDialogComponent {
  @Input() outfitId: string | null = null;

  constructor(private readonly modals: ModalController) {}

  close(role: 'save' | 'download' | 'explore'): void {
    void this.modals.dismiss(undefined, role);
  }
}
