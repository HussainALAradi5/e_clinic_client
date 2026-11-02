import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ScanPurpose } from '@enums/code/scan-purpose.enum';
import { CodeImage } from '@interfaces/code/code-image.interface';
import { CodeImageOptions } from '@interfaces/code/code-image-options.interface';
import { ScanResult } from '@interfaces/code/scan-result.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Identity › Codes — signed QR / barcodes of records, scanning and public document verification. */
@Injectable({ providedIn: 'root' })
export class CodeApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);

  /** Image as an object URL (revoke it with URL.revokeObjectURL when done) + the encoded payload. */
  image(entity: string, id: string, options: CodeImageOptions = {}): Observable<CodeImage> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) {
        params[key] = String(value);
      }
    }
    return this.http
      .get(`${ENDPOINTS.codes}/${entity}/${id}`, {
        params,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((res: HttpResponse<Blob>) => ({
          url: URL.createObjectURL(res.body ?? new Blob()),
          payload: res.headers.get('X-Code-Payload') ?? '',
        })),
      );
  }

  scan(payload: string, purpose: ScanPurpose): Observable<ScanResult> {
    return this.api.post<ScanResult>(`${ENDPOINTS.codes}/scan`, {
      payload: payload.trim(),
      purpose,
    });
  }

  /** Public authenticity check (no sign-in). */
  verify(payload: string): Observable<ScanResult> {
    return this.api.get<ScanResult>(
      `${ENDPOINTS.public}/verify/${encodeURIComponent(payload.trim())}`,
    );
  }
}
