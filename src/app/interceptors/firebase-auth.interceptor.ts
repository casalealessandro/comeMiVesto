import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class FirebaseAuthInterceptor implements HttpInterceptor {
  constructor(private angularFireAuth: AngularFireAuth) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isBackendRequest =
      request.url === environment.BASE_API_URL ||
      request.url.startsWith(`${environment.BASE_API_URL}/`);

    if (!isBackendRequest) {
      return next.handle(request);
    }

    return from(this.angularFireAuth.currentUser).pipe(
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
