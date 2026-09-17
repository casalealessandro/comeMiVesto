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

interface PublicApiRoute {
  method: string;
  path: RegExp;
}

const PUBLIC_API_ROUTES: PublicApiRoute[] = [
  { method: 'GET', path: /^\/gen\/forms\/[^/]+$/ },
  { method: 'POST', path: /^\/user\/register$/ },
  { method: 'POST', path: /^\/user\/token$/ },
];

@Injectable()
export class FirebaseAuthInterceptor implements HttpInterceptor {
  constructor(private firebase: FirebaseService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isBackendRequest =
      request.url === environment.BASE_API_URL ||
      request.url.startsWith(`${environment.BASE_API_URL}/`);

    if (!isBackendRequest) {
      return next.handle(request);
    }

    const relativePath = request.url
      .slice(environment.BASE_API_URL.length)
      .split('?')[0];

    const isPublicApiRequest = PUBLIC_API_ROUTES.some(
      (route) => route.method === request.method && route.path.test(relativePath),
    );

    if (isPublicApiRequest) {
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
