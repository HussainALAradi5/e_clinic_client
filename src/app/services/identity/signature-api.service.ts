import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { ApiClient } from '@services/api/api-client.service';

/** The signed-in staff member's own signature (drawn or uploaded), printed on the documents they issue. */
@Injectable({ providedIn: 'root' })
export class SignatureApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);
  private readonly path = ENDPOINTS.auth.signature;

  /** The signature as an object URL (revoke it when done), or null while there is none. */
  current(): Observable<string | null> {
    return this.http.get(this.path, { responseType: 'blob' }).pipe(
      map((blob) => URL.createObjectURL(blob)),
      catchError(() => of(null)),
    );
  }

  save(image: Blob, fileName: string): Observable<unknown> {
    const body = new FormData();
    body.append('signature', image, fileName);
    return this.api.post(this.path, body);
  }

  remove(): Observable<void> {
    return this.api.delete(this.path);
  }
}
