import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import { ExportOutcome } from '@interfaces/list/export-outcome.type';
import { ExportRequest } from '@interfaces/list/export-request.interface';
import { ImportResult } from '@interfaces/list/import-result.interface';
import { ApiClient } from '@services/api/api-client.service';
import { blobText, downloadBlob } from '@utilities/download';

/** HTTP 202: the export runs as a background task; the body is the JSON envelope. */
const ACCEPTED = 202;

/**
 * Export / import of any list (server: Route::dataTransfer). Each operation is one request; the server does the work.
 *   POST <endpoint>/export · GET <endpoint>/import/template · POST <endpoint>/import
 */
@Injectable({ providedIn: 'root' })
export class TransferApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiClient);

  /** Saves the file when it comes back at once; otherwise returns the background task to follow. */
  export(endpoint: string, request: ExportRequest): Observable<ExportOutcome> {
    return this.http
      .post(`${endpoint}/export`, request, { responseType: 'blob', observe: 'response' })
      .pipe(switchMap((response) => from(this.outcome(response))));
  }

  /** Downloads the Excel template (columns to fill, an example sheet and instructions). */
  template(endpoint: string): Observable<void> {
    return this.http
      .get(`${endpoint}/import/template`, { responseType: 'blob', observe: 'response' })
      .pipe(map((response) => downloadBlob(response, 'import-template.xlsx')));
  }

  /** All rows saved, or an ApiError IMPORT_FAILED with `meta.rows` (nothing saved). */
  import(endpoint: string, file: File): Observable<ImportResult> {
    const body = new FormData();
    body.append('file', file);
    return this.api.post<ImportResult>(`${endpoint}/import`, body);
  }

  private async outcome(response: HttpResponse<Blob>): Promise<ExportOutcome> {
    if (response.status !== ACCEPTED) {
      downloadBlob(response, 'export');
      return { downloaded: true };
    }
    // Blob bodies skip the case interceptor, so the envelope keeps its snake_case keys.
    const envelope = JSON.parse(response.body ? await blobText(response.body) : '{}') as {
      data?: { task_id?: string; rows?: number };
    };
    return {
      downloaded: false,
      taskId: envelope.data?.task_id ?? '',
      rows: envelope.data?.rows ?? 0,
    };
  }
}
