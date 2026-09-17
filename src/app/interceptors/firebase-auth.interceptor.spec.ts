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

  it('adds the Firebase ID token to backend requests', (done) => {
    firebase.waitForAuthState.and.resolveTo({
      getIdToken: () => Promise.resolve('firebase-token'),
    } as any);

    new FirebaseAuthInterceptor(firebase).intercept(
      new HttpRequest('GET', `${environment.BASE_API_URL}/user/profile`),
      handler,
    ).subscribe({ complete: () => {
      const forwarded = handler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
      expect(forwarded.headers.get('Authorization')).toBe('Bearer firebase-token');
      done();
    } });
  });

  it('keeps backend requests unchanged when signed out', (done) => {
    firebase.waitForAuthState.and.resolveTo(null);
    const request = new HttpRequest('GET', environment.BASE_API_URL);

    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe({ complete: () => {
      expect(handler.handle).toHaveBeenCalledOnceWith(request);
      done();
    } });
  });

  it('does not wait for auth on public form requests', () => {
    const request = new HttpRequest('GET', `${environment.BASE_API_URL}/gen/forms/loginForm`);
    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe();

    expect(firebase.waitForAuthState).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledOnceWith(request);
  });

  it('does not inspect auth or add a token to external requests', () => {
    const request = new HttpRequest('GET', 'https://example.com/image.jpg');
    new FirebaseAuthInterceptor(firebase).intercept(request, handler).subscribe();

    expect(firebase.waitForAuthState).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledOnceWith(request);
  });
});
