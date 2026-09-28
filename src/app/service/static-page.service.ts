import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiRequestError, ApiResponse } from './app-service';
import { StaticPage } from './interface/static-page-interface';

@Injectable({
  providedIn: 'root'
})
export class StaticPageService {
  private apiFire = `${environment.BASE_API_URL}/gen/static-pages`;

  constructor(private http: HttpClient) {}

  getStaticPage(slug: string): Observable<StaticPage> {
    return this.http
      .get<ApiResponse<StaticPage>>(`${this.apiFire}/${encodeURIComponent(slug)}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let userFriendlyMessage: string;

    if (error.error instanceof ErrorEvent) {
      console.error('Errore client-side:', error.error.message);
      userFriendlyMessage = 'Si è verificato un problema di rete. Riprova più tardi.';
    } else {
      console.error(
        `Errore server-side: codice ${error.status}, messaggio: ${error.message}`
      );
      switch (error.status) {
        case 404:
          userFriendlyMessage = 'Pagina non trovata.';
          break;
        case 500:
          userFriendlyMessage = 'Errore interno del server. Riprova più tardi.';
          break;
        default:
          userFriendlyMessage = 'Si è verificato un errore imprevisto. Riprova più tardi.';
      }
    }

    return throwError(() => new ApiRequestError(userFriendlyMessage, error.status));
  }
}
