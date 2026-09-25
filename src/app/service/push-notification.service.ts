import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import {
  ActionPerformed as LocalNotificationActionPerformed,
  LocalNotifications,
} from '@capacitor/local-notifications';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
} from '@capacitor/push-notifications';
import { firstValueFrom, map, Subscription, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './app-service';
import { DeepLinkService } from './deep-link.service';
import { FirebaseService } from './firebase.service';

export interface NotificationPreferences {
  enabled: boolean;
  dailyEnabled: boolean;
}

type MobilePlatform = 'android' | 'ios';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private initialized = false;
  private authSubscription?: Subscription;
  private registrationInProgress = false;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly http: HttpClient,
    private readonly deepLinkService: DeepLinkService,
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized || !Capacitor.isNativePlatform()) {
      return;
    }

    const platform = this.getMobilePlatform();
    if (!platform) {
      return;
    }

    this.initialized = true;

    try {
      await PushNotifications.addListener('registration', () => {
        void this.synchronizeToken(platform);
      });
      await PushNotifications.addListener('registrationError', () => {
        console.warn('Push registration is unavailable.');
      });
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        void this.presentForegroundNotification(notification);
      });
      await PushNotifications.addListener('pushNotificationActionPerformed', (event: ActionPerformed) => {
        this.handleNotificationAction(event);
      });

      if (platform === 'android') {
        await LocalNotifications.addListener('localNotificationActionPerformed', (event: LocalNotificationActionPerformed) => {
          this.handleDeepLink(event.notification.extra?.['deepLink']);
        });
      }

      this.authSubscription = this.firebase.authState.subscribe((user) => {
        if (user) {
          void this.registerForPush();
        }
      });
    } catch {
      console.warn('Push notifications are unavailable.');
    }
  }

  async disableCurrentDevice(): Promise<void> {
    if (!Capacitor.isNativePlatform() || !this.getMobilePlatform()) {
      return;
    }

    let token: string | undefined;
    try {
      token = (await FCM.getToken()).token;
    } catch {
      console.warn('Could not read the push token during logout.');
    }

    if (token) {
      try {
        await firstValueFrom(
          this.http.delete(`${environment.BASE_API_URL}/gen/notifications/device`, {
            body: { token },
          }).pipe(timeout(1500)),
        );
      } catch {
        console.warn('Could not disable the push device on the server.');
      }
    }

  }

  getPreferences() {
    return this.http.get<ApiResponse<NotificationPreferences>>(`${environment.BASE_API_URL}/gen/notifications/preferences`).pipe(
      map((response) => response.data),
    );
  }

  updatePreferences(preferences: NotificationPreferences) {
    return this.http.put<ApiResponse<NotificationPreferences>>(`${environment.BASE_API_URL}/gen/notifications/preferences`, preferences).pipe(
      map((response) => response.data),
    );
  }

  private async registerForPush(): Promise<void> {
    if (this.registrationInProgress) {
      return;
    }

    this.registrationInProgress = true;
    try {
      let permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
        permission = await PushNotifications.requestPermissions();
      }
      if (permission.receive !== 'granted') {
        return;
      }
      await PushNotifications.register();
    } catch {
      console.warn('Push registration could not be started.');
    } finally {
      this.registrationInProgress = false;
    }
  }

  private async synchronizeToken(platform: MobilePlatform): Promise<void> {
    try {
      const { token } = await FCM.getToken();
      if (!token) {
        console.warn('No FCM token is available.');
        return;
      }
      await firstValueFrom(this.http.post(`${environment.BASE_API_URL}/gen/notifications/device`, {
        token,
        platform,
      }));
    } catch {
      console.warn('Push device synchronization failed.');
    }
  }

  private handleNotificationAction(event: ActionPerformed): void {
    this.handleDeepLink(event.notification.data?.['deepLink']);
  }

  private handleDeepLink(deepLink: unknown): void {
    if (typeof deepLink === 'string') {
      this.deepLinkService.handle(deepLink);
    }
  }

  private async presentForegroundNotification(notification: PushNotificationSchema): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now() % 2147483647,
          title: notification.title ?? 'Come mi vesto',
          body: notification.body ?? '',
          extra: notification.data,
        }],
      });
    } catch {
      console.warn('Could not present the foreground notification.');
    }
  }

  private getMobilePlatform(): MobilePlatform | null {
    const platform = Capacitor.getPlatform();
    return platform === 'android' || platform === 'ios' ? platform : null;
  }
}
