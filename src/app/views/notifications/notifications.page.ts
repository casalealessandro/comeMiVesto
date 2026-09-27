import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import {
  NotificationPreferences,
  PushNotificationService,
} from 'src/app/service/push-notification.service';

@Component({
  standalone: false,
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  preferences: NotificationPreferences = {
    enabled: true,
    dailyEnabled: true,
  };

  loading = true;
  saving = false;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unavailable' = 'unavailable';

  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly alertController: AlertController,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadPreferences(),
        this.loadPermissionStatus(),
      ]);
    } finally {
      this.loading = false;
    }
  }

  async onNotificationsChange(event: CustomEvent): Promise<void> {
    const enabled = Boolean(event.detail.checked);
    const previous = { ...this.preferences };

    this.preferences = {
      ...this.preferences,
      enabled,
    };

    await this.savePreferences(previous);
  }

  async onDailyChange(event: CustomEvent): Promise<void> {
    const previous = { ...this.preferences };

    this.preferences = {
      ...this.preferences,
      dailyEnabled: Boolean(event.detail.checked),
    };

    await this.savePreferences(previous);
  }

  get permissionLabel(): string {
    if (this.permissionStatus === 'granted') {
      return 'Autorizzate';
    }

    if (this.permissionStatus === 'denied') {
      return 'Disattivate sul dispositivo';
    }

    if (this.permissionStatus === 'prompt') {
      return 'Da autorizzare';
    }

    return 'Non disponibile';
  }

  private async loadPreferences(): Promise<void> {
    try {
      this.preferences = await firstValueFrom(this.pushNotificationService.getPreferences());
    } catch {
      await this.showError('Non è stato possibile caricare le preferenze delle notifiche.');
    }
  }

  private async loadPermissionStatus(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.permissionStatus = 'unavailable';
      return;
    }

    try {
      const permission = await PushNotifications.checkPermissions();

      if (permission.receive === 'granted') {
        this.permissionStatus = 'granted';
      } else if (permission.receive === 'denied') {
        this.permissionStatus = 'denied';
      } else {
        this.permissionStatus = 'prompt';
      }
    } catch {
      this.permissionStatus = 'unavailable';
    }
  }

  private async savePreferences(previous: NotificationPreferences): Promise<void> {
    if (this.saving) {
      return;
    }

    this.saving = true;

    try {
      this.preferences = await firstValueFrom(
        this.pushNotificationService.updatePreferences(this.preferences),
      );
    } catch {
      this.preferences = previous;
      await this.showError('Non è stato possibile aggiornare le preferenze delle notifiche.');
    } finally {
      this.saving = false;
    }
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Attenzione!',
      message,
      buttons: ['Ok'],
    });

    await alert.present();
  }
}
