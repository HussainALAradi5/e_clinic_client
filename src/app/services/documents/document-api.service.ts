import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { DocumentType } from '@enums/documents/document-type.enum';
import { GeneratedDocument } from '@interfaces/documents/generated-document.interface';
import { ApiClient } from '@services/api/api-client.service';
import { downloadBlob, openBlob } from '@utilities/download';

/** Documents — the branded PDF of any record the user may read: its details, opened in a tab or saved. */
@Injectable({ providedIn: 'root' })
export class DocumentApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);

  /** The record's current document (made on the server on first use): code, file name, size. */
  info(type: DocumentType, id: string): Observable<GeneratedDocument> {
    return this.api.get<GeneratedDocument>(this.path(type, id));
  }

  /**
   * Shows the PDF in the browser's viewer (read, zoom, print): in `tab` — opened on the click, before the download,
   * so popup blockers allow it — or in a new tab.
   */
  open(type: DocumentType, id: string, tab: Window | null = null): Observable<void> {
    return this.http
      .get(`${this.path(type, id)}/file`, { responseType: 'blob' })
      .pipe(map((blob) => openBlob(blob, tab)));
  }

  /** Saves the PDF under its unique file name. */
  download(type: DocumentType, id: string): Observable<void> {
    return this.http
      .get(`${this.path(type, id)}/file`, {
        params: { download: '1' },
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(map((response) => downloadBlob(response, `${type}.pdf`)));
  }

  private path(type: DocumentType, id: string): string {
    return `${ENDPOINTS.documents}/${type}/${id}`;
  }
}
