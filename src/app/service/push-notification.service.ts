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
  Token,
} from '@capacitor/push-notifications';
import { firstValueFrom, map, Subscription, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './app-service';
import { DeepLinkService } from './deep-link.service';
import { FirebaseService } from './firebase.service';
import { CrashReportingService } from './crash-reporting.service';

export interface NotificationPreferences {
  enabled: boolean;
  dailyEnabled: boolean;
}

interface PushFeatureFlags {
  enabled?: boolean;
  androidEnabled?: boolean;
  iosEnabled?: boolean;
}

interface BootstrapResponse {
  data?: {
    features?: {
      pushNotifications?: PushFeatureFlags;
    };
  };
}

type MobilePlatform = 'android' | 'ios';

const PUSH_TOKEN_STORAGE_KEY = 'come-mivesto.push-notifications.fcm-token';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private initialized = false;
  private authSubscription?: Subscription;
  private registrationInProgress = false;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly http: HttpClient,
    private readonly deepLinkService: DeepLinkService,
    private readonly crashReporting: CrashReportingService,
  ) {}

  async initialize(): Promise<void> {
    this.crashReporting.log('PUSH_INIT_START');
    if (this.initialized || !Capacitor.isNativePlatform()) {
      return;
    }

    const platform = this.getMobilePlatform();
    if (!platform) {
      return;
    }

    this.initialized = true;

    try {
      await PushNotifications.addListener('registration', (token: Token) => {
        this.crashReporting.log('PUSH_REGISTRATION_CALLBACK');
        void this.synchronizeRegistrationToken(token, platform);
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
          void this.registerForPushIfEnabled(platform);
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

    const token = this.getStoredToken();

    if (token) {
      try {
        await firstValueFrom(
          this.http.delete(`${environment.BASE_API_URL}/gen/notifications/device`, {
            body: { token },
          }).pipe(timeout(1500)),
        );
        this.clearStoredToken();
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

  private async registerForPushIfEnabled(platform: MobilePlatform): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<BootstrapResponse>(`${environment.BASE_API_URL}/user/bootstrap`).pipe(timeout(3000)),
      );
      const flags = response.data?.features?.pushNotifications;
      const platformEnabled = platform === 'android'
        ? flags?.androidEnabled === true
        : flags?.iosEnabled === true;

      if (flags?.enabled !== true || !platformEnabled) {
        this.crashReporting.log('PUSH_FEATURE_DISABLED');
        return;
      }

      await this.registerForPush();
    } catch {
      console.warn('Push feature bootstrap unavailable; skipping registration.');
    }
  }

  private async registerForPush(): Promise<void> {
    if (this.registrationInProgress) {
      return;
    }

    this.registrationInProgress = true;
    try {
      this.crashReporting.log('PUSH_PERMISSION_CHECK');
      let permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
        this.crashReporting.log('PUSH_PERMISSION_REQUEST');
        permission = await PushNotifications.requestPermissions();
      }
      if (permission.receive !== 'granted') {
        return;
      }
      this.crashReporting.log('PUSH_REGISTER_START');
      await PushNotifications.register();
    } catch (error) {
      this.crashReporting.recordError(error, 'PUSH_REGISTER_ERROR');
      console.warn('Push registration could not be started.');
    } finally {
      this.registrationInProgress = false;
    }
  }

  private async synchronizeRegistrationToken(registrationToken: Token, platform: MobilePlatform): Promise<void> {
    this.crashReporting.log('PUSH_DEVICE_SYNC_START');
    try {
      // Capacitor emits an FCM token on Android, but an APNs token on iOS.
      const token = platform === 'android'
        ? registrationToken.value
        : (await FCM.getToken()).token;
      if (!token) {
        console.warn('No FCM token is available.');
        return;
      }

      this.storeToken(token);
      await firstValueFrom(this.http.post(`${environment.BASE_API_URL}/gen/notifications/device`, {
        token,
        platform,
      }));
      this.crashReporting.log('PUSH_DEVICE_SYNC_SUCCESS');
    } catch (error: any) {
      console.error('PUSH_DEVICE_SYNC_ERROR', {
        status: error?.status,
        statusText: error?.statusText,
        url: error?.url,
        message: error?.message,
        error: error?.error,
      });
      this.crashReporting.log('PUSH_DEVICE_SYNC_ERROR');
      this.crashReporting.recordError(error, 'PUSH_DEVICE_SYNC_ERROR');
      console.warn('Push device synchronization failed.');
    }
  }

  private getStoredToken(): string | undefined {
    try {
      return localStorage.getItem(PUSH_TOKEN_STORAGE_KEY) || undefined;
    } catch {
      console.warn('Could not read the stored push token.');
      return undefined;
    }
  }

  private storeToken(token: string): void {
    try {
      // The FCM token belongs to this app installation and must survive app restarts for logout cleanup.
      localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    } catch {
      console.warn('Could not persist the push token.');
    }
  }

  private clearStoredToken(): void {
    try {
      localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    } catch {
      console.warn('Could not clear the stored push token.');
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
