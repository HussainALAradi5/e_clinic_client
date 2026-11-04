import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';
import { Page } from '@interfaces/api/page.interface';
import { WrittenDocument } from '@interfaces/documents/written-document.interface';
import { WrittenDocumentPayload } from '@interfaces/documents/written-document-payload.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Documents written from a visit session: list them, auto-generate a draft, save one. */
@Injectable({ providedIn: 'root' })
export class WrittenDocumentApi {
  private readonly api = inject(ApiClient);

  list(query: ListQuery): Observable<Page<WrittenDocument>> {
    return this.api.list<WrittenDocument>(ENDPOINTS.writtenDocuments, query);
  }

  /** The template (or the given text) with every field filled from the visit; nothing is saved. */
  draft(
    appointmentId: string,
    kind: WrittenDocumentKind,
    templateId: string | null,
    body: string | null,
  ): Observable<string> {
    return this.api
      .post<{ body: string }>(
        `${ENDPOINTS.appointments}/${appointmentId}/written-documents/draft`,
        { kind, templateId, body },
      )
      .pipe(map((res) => res.body));
  }

  write(appointmentId: string, payload: WrittenDocumentPayload): Observable<WrittenDocument> {
    return this.api.post<WrittenDocument>(
      `${ENDPOINTS.appointments}/${appointmentId}/written-documents`,
      payload,
    );
  }
}
