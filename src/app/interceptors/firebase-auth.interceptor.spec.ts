import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FirebaseService } from '../service/firebase.service';
import { FirebaseAuthInterceptor } from './firebase-auth.interceptor';

describe('FirebaseAuthInterceptor', () => {
  let firebase: jasmine.SpyObj<FirebaseService>;
  let handler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    firebase = jasmine.createSpyObj<FirebaseService>('FirebaseService', ['waitForAuthState']);
    handler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    handler.handle.and.returnValue(of(new HttpResponse()));
  });

  it('adds the Firebase ID token to protected backend requests', (done) => {
    firebase.waitForAuthState.and.resolveTo({
      getIdToken: () => Promise.resolve('firebase-token'),
    } as any);

    new FirebaseAuthInterceptor(firebase).intercept(
      new HttpRequest('GET', `${environment.BASE_API_URL}/user/user-profile/test-user`),
      handler,
    ).subscribe({ complete: () => {
      const forwarded = handler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
      expect(forwarded.headers.get('Authorization')).toBe('Bearer firebase-token');
      done();
    } });
  });

  it('keeps protected backend requests unchanged when signed out', (done) => {
    firebase.waitForAuthState.and.resolveTo(null);
    const request = new HttpRequest('GET', `${environment.BASE_API_URL}/gen/outfits`);

    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe({ complete: () => {
      expect(handler.handle).toHaveBeenCalledOnceWith(request);
      done();
    } });
  });

  it('does not wait for auth on public form detail requests', () => {
    const request = new HttpRequest('GET', `${environment.BASE_API_URL}/gen/forms/loginForm`);

    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe();

    expect(firebase.waitForAuthState).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledOnceWith(request);
  });

  it('does not wait for auth on public registration requests', () => {
    const request = new HttpRequest('POST', `${environment.BASE_API_URL}/user/register`, {});

    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe();

    expect(firebase.waitForAuthState).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledOnceWith(request);
  });

  it('does not wait for auth on public token requests', () => {
    const request = new HttpRequest('POST', `${environment.BASE_API_URL}/user/token`, {});

    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe();

    expect(firebase.waitForAuthState).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledOnceWith(request);
  });

  it('keeps the forms collection protected', (done) => {
    firebase.waitForAuthState.and.resolveTo({
      getIdToken: () => Promise.resolve('firebase-token'),
    } as any);

    new FirebaseAuthInterceptor(firebase).intercept(
      new HttpRequest('GET', `${environment.BASE_API_URL}/gen/forms`),
      handler,
    ).subscribe({ complete: () => {
      expect(firebase.waitForAuthState).toHaveBeenCalled();
      const forwarded = handler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
      expect(forwarded.headers.get('Authorization')).toBe('Bearer firebase-token');
      done();
    } });
  });

  it('does not inspect auth or add a token to external requests', () => {
    const request = new HttpRequest('GET', 'https://example.com/image.jpg');

    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe();

    expect(firebase.waitForAuthState).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledOnceWith(request);
  });
});
