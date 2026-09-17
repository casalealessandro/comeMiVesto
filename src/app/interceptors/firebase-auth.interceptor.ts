import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FirebaseService } from '../service/firebase.service';

@Injectable()
export class FirebaseAuthInterceptor implements HttpInterceptor {
  constructor(private firebase: FirebaseService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isBackendRequest =
      request.url === environment.BASE_API_URL ||
      request.url.startsWith(`${environment.BASE_API_URL}/`);
    const isPublicFormRequest =
      request.method === 'GET' &&
      request.url.startsWith(`${environment.BASE_API_URL}/gen/forms/`);

    if (!isBackendRequest || isPublicFormRequest) {
      return next.handle(request);
    }

    return from(this.firebase.waitForAuthState()).pipe(
      switchMap((user) => {
        if (!user) {
          return next.handle(request);
        }

        return from(user.getIdToken()).pipe(
          switchMap((token) =>
            next.handle(
              request.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
              }),
            ),
          ),
        );
      }),
    );
  }
}
