import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
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
  const pushTokenStorageKey = 'come-mivesto.push-notifications.fcm-token';
  let service: PushNotificationService;
  let http: HttpTestingController;
  let authState: BehaviorSubject<unknown>;
  let deepLinks: jasmine.SpyObj<DeepLinkService>;
  let listeners: Record<string, (event: any) => void>;

  beforeEach(() => {
    localStorage.removeItem(pushTokenStorageKey);
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

  afterEach(() => {
    localStorage.removeItem(pushTokenStorageKey);
    http.verify();
  });

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

  it('uses the Android registration token for the authenticated user without asking FCM again', async () => {
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
    expect(request.request.body).toEqual({ token: 'native-token', platform: 'android' });
    expect(localStorage.getItem(pushTokenStorageKey)).toBe('native-token');
    expect(FCM.getToken).not.toHaveBeenCalled();
    request.flush({ message: 'Success', data: null });
  });

  it('does not start native registration when push is globally disabled', async () => {
    await service.initialize();
    authState.next({ uid: 'user' });
    await Promise.resolve();

    http.expectOne(`${environment.BASE_API_URL}/user/bootstrap`).flush({
      data: { features: { pushNotifications: { enabled: false, androidEnabled: true } } },
    });
    await Promise.resolve();

    expect(PushNotifications.checkPermissions).not.toHaveBeenCalled();
    expect(PushNotifications.register).not.toHaveBeenCalled();
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

  it('does not register when notification permission is denied', async () => {
    (PushNotifications.checkPermissions as jasmine.Spy).and.resolveTo({ receive: 'denied' });
    await service.initialize();
    authState.next({ uid: 'user' });
    await Promise.resolve();

    http.expectOne(`${environment.BASE_API_URL}/user/bootstrap`).flush({
      data: { features: { pushNotifications: { enabled: true, androidEnabled: true } } },
    });
    await Promise.resolve();

    expect(PushNotifications.requestPermissions).not.toHaveBeenCalled();
    expect(PushNotifications.register).not.toHaveBeenCalled();
  });

  it('requests a prompted permission and registers when permission is granted', async () => {
    (PushNotifications.checkPermissions as jasmine.Spy).and.resolveTo({ receive: 'prompt' });
    await service.initialize();
    authState.next({ uid: 'user' });
    await Promise.resolve();

    http.expectOne(`${environment.BASE_API_URL}/user/bootstrap`).flush({
      data: { features: { pushNotifications: { enabled: true, androidEnabled: true } } },
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(PushNotifications.requestPermissions).toHaveBeenCalled();
    expect(PushNotifications.register).toHaveBeenCalled();
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

  it('upserts refreshed Android FCM tokens emitted by native registration', async () => {
    await service.initialize();

    listeners['registration']({ value: 'first-token' });
    await Promise.resolve();
    const firstRequest = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(firstRequest.request.body.token).toBe('first-token');
    firstRequest.flush({ message: 'Success', data: null });
    await Promise.resolve();

    listeners['registration']({ value: 'refreshed-token' });
    await Promise.resolve();
    const refreshedRequest = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(refreshedRequest.request.body.token).toBe('refreshed-token');
    refreshedRequest.flush({ message: 'Success', data: null });
    expect(FCM.getToken).not.toHaveBeenCalled();
  });

  it('keeps iOS on the FCM token path instead of sending the APNs token', async () => {
    (Capacitor.getPlatform as jasmine.Spy).and.returnValue('ios');
    await service.initialize();

    listeners['registration']({ value: 'apns-token' });
    await Promise.resolve();
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(request.request.body).toEqual({ token: 'fcm-token', platform: 'ios' });
    request.flush({ message: 'Success', data: null });

    expect(FCM.getToken).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(pushTokenStorageKey)).toBe('fcm-token');
  });

  it('fails safe when backend token synchronization fails', async () => {
    await service.initialize();

    listeners['registration']({ value: 'native-token' });
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    request.flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    await Promise.resolve();

    expect(localStorage.getItem(pushTokenStorageKey)).toBe('native-token');
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
    localStorage.setItem(pushTokenStorageKey, 'stored-token');
    const result = service.disableCurrentDevice();

    const request = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ token: 'stored-token' });
    request.flush({ message: 'error' }, { status: 503, statusText: 'Unavailable' });

    await expectAsync(result).toBeResolved();
    expect(FCM.getToken).not.toHaveBeenCalled();
  });

  it('disables the current device with a token restored after an app restart', async () => {
    localStorage.setItem(pushTokenStorageKey, 'persisted-token');

    const result = service.disableCurrentDevice();
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(request.request.body).toEqual({ token: 'persisted-token' });
    request.flush({ message: 'Success', data: null });

    await expectAsync(result).toBeResolved();
  });

  it('finishes logout cleanup when deleting the device times out', fakeAsync(() => {
    localStorage.setItem(pushTokenStorageKey, 'stored-token');
    let completed = false;

    void service.disableCurrentDevice().then(() => completed = true);
    const request = http.expectOne(`${environment.BASE_API_URL}/gen/notifications/device`);
    tick(1501);
    flushMicrotasks();

    expect(request.cancelled).toBeTrue();
    expect(completed).toBeTrue();
  }));

  it('finishes logout cleanup without native calls when no token is known', async () => {
    await expectAsync(service.disableCurrentDevice()).toBeResolved();

    http.expectNone(`${environment.BASE_API_URL}/gen/notifications/device`);
    expect(FCM.getToken).not.toHaveBeenCalled();
  });

  it('fails safe when push listener setup is unavailable', async () => {
    (PushNotifications.addListener as jasmine.Spy).and.rejectWith(new Error('plugin unavailable'));

    await expectAsync(service.initialize()).toBeResolved();
    authState.next({ uid: 'user' });

    http.expectNone(`${environment.BASE_API_URL}/user/bootstrap`);
  });

  it('fails safe when native registration rejects', async () => {
    (PushNotifications.register as jasmine.Spy).and.rejectWith(new Error('plugin unavailable'));
    await service.initialize();
    authState.next({ uid: 'user' });
    await Promise.resolve();

    http.expectOne(`${environment.BASE_API_URL}/user/bootstrap`).flush({
      data: { features: { pushNotifications: { enabled: true, androidEnabled: true } } },
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(PushNotifications.register).toHaveBeenCalled();
  });
});
