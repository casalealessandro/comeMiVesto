import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ActionPerformed, PushNotifications } from '@capacitor/push-notifications';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DeepLinkService } from './deep-link.service';
import { FirebaseService } from './firebase.service';
import { PushNotificationService } from './push-notification.service';

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let http: HttpTestingController;
  let authState: BehaviorSubject<unknown>;
  let deepLinks: jasmine.SpyObj<DeepLinkService>;
  let listeners: Record<string, (event: any) => void>;

  beforeEach(() => {
    authState = new BehaviorSubject<unknown>(null);
    deepLinks = jasmine.createSpyObj<DeepLinkService>('DeepLinkService', ['handle']);
    listeners = {};

    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    spyOn(Capacitor, 'getPlatform').and.returnValue('android');
    spyOn(PushNotifications, 'addListener').and.callFake(((eventName: string, callback: any) => {
      listeners[eventName] = callback;
      return Promise.resolve({ remove: () => Promise.resolve() });
    }) as any);
    spyOn(PushNotifications, 'checkPermissions').and.resolveTo({ receive: 'granted' });
    spyOn(PushNotifications, 'requestPermissions').and.resolveTo({ receive: 'granted' });
    spyOn(PushNotifications, 'register').and.resolveTo();
    spyOn(FCM, 'getToken').and.resolveTo({ token: 'fcm-token' });
    spyOn(LocalNotifications, 'addListener').and.callFake(((eventName: string, callback: any) => {
      listeners[eventName] = callback;
      return Promise.resolve({ remove: () => Promise.resolve() });
    }) as any);
    spyOn(LocalNotifications, 'schedule').and.resolveTo({ notifications: [] });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FirebaseService, useValue: { authState } },
        { provide: DeepLinkService, useValue: deepLinks },
      ],
    });
    service = TestBed.inject(PushNotificationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('skips initialization on web', async () => {
    (Capacitor.isNativePlatform as jasmine.Spy).and.returnValue(false);

    await service.initialize();

    expect(PushNotifications.addListener).not.toHaveBeenCalled();
  });

  it('initializes listeners only once', async () => {
    await service.initialize();
    await service.initialize();

    expect(PushNotifications.addListener).toHaveBeenCalledTimes(4);
    expect(LocalNotifications.addListener).toHaveBeenCalledTimes(1);
  });

  it('registers the FCM token for the authenticated user', async () => {
    await service.initialize();
    authState.next({ uid: 'user' });
    await Promise.resolve();
    await Promise.resolve();

    const bootstrapRequest = http.expectOne(`${environment.BASE_API_URL}/user/bootstrap`);
    expect(bootstrapRequest.request.method).toBe('GET');
    bootstrapRequest.flush({
      data: {
        features: {
          pushNotifications: {
            enabled: true,
            androidEnabled: true,
            iosEnabled: false,
          },
        },
      },
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(PushNotifications.register).toHaveBeenCalled();

    listeners['registration']({ value: 'native-token' });
    await Promise.resolve();
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'fcm-token', platform: 'android' });
    request.flush({ message: 'Success', data: null });
  });

  it('does not start native registration when Android push is disabled by bootstrap', async () => {
    await service.initialize();
    authState.next({ uid: 'user' });
    await Promise.resolve();
    await Promise.resolve();

    const bootstrapRequest = http.expectOne(`${environment.BASE_API_URL}/user/bootstrap`);
    bootstrapRequest.flush({
      data: {
        features: {
          pushNotifications: {
            enabled: true,
            androidEnabled: false,
            iosEnabled: true,
          },
        },
      },
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(PushNotifications.register).not.toHaveBeenCalled();
  });

  it('fails safe when the bootstrap feature check is unavailable', async () => {
    await service.initialize();
    authState.next({ uid: 'user' });
    await Promise.resolve();
    await Promise.resolve();

    const bootstrapRequest = http.expectOne(`${environment.BASE_API_URL}/user/bootstrap`);
    bootstrapRequest.flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await Promise.resolve();
    await Promise.resolve();

    expect(PushNotifications.register).not.toHaveBeenCalled();
  });

  it('upserts a refreshed FCM token emitted by native registration', async () => {
    (FCM.getToken as jasmine.Spy).and.returnValues(
      Promise.resolve({ token: 'first-token' }),
      Promise.resolve({ token: 'refreshed-token' }),
    );
    await service.initialize();

    listeners['registration']({ value: 'native-token' });
    await Promise.resolve();
    const firstRequest = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(firstRequest.request.body.token).toBe('first-token');
    firstRequest.flush({ message: 'Success', data: null });
    await Promise.resolve();

    listeners['registration']({ value: 'updated-native-token' });
    await Promise.resolve();
    const refreshedRequest = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(refreshedRequest.request.body.token).toBe('refreshed-token');
    refreshedRequest.flush({ message: 'Success', data: null });
  });

  it('passes notification deep links to DeepLinkService', async () => {
    await service.initialize();
    listeners['pushNotificationActionPerformed']({
      notification: { data: { deepLink: 'comemivesto://outfit/42' } },
    } as unknown as ActionPerformed);

    expect(deepLinks.handle).toHaveBeenCalledWith('comemivesto://outfit/42');
  });

  it('ignores notification actions without a deep link', async () => {
    await service.initialize();
    listeners['pushNotificationActionPerformed']({ notification: { data: {} } } as unknown as ActionPerformed);

    expect(deepLinks.handle).not.toHaveBeenCalled();
  });

  it('presents foreground notifications on Android and preserves their data', async () => {
    await service.initialize();
    listeners['pushNotificationReceived']({
      id: 'push-id',
      title: 'Outfit pronto',
      body: 'Apri il tuo outfit',
      data: { deepLink: 'comemivesto://outfit/42' },
    });
    await Promise.resolve();

    expect(LocalNotifications.schedule).toHaveBeenCalledWith({
      notifications: [jasmine.objectContaining({
        title: 'Outfit pronto',
        body: 'Apri il tuo outfit',
        extra: { deepLink: 'comemivesto://outfit/42' },
      })],
    });
  });

  it('routes Android local notification taps through DeepLinkService', async () => {
    await service.initialize();
    listeners['localNotificationActionPerformed']({
      notification: { extra: { deepLink: 'comemivesto://outfit/99' } },
    });

    expect(deepLinks.handle).toHaveBeenCalledWith('comemivesto://outfit/99');
  });

  it('disables the current device without throwing when the backend fails', async () => {
    await service.initialize();
    const result = service.disableCurrentDevice();
    await Promise.resolve();

    const request = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ token: 'fcm-token' });
    request.flush({ message: 'error' }, { status: 503, statusText: 'Unavailable' });

    await expectAsync(result).toBeResolved();
    expect(FCM.getToken).toHaveBeenCalled();
  });
});
