import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { Page } from '@interfaces/api/page.interface';
import { DocumentTemplate } from '@interfaces/documents/document-template.interface';
import { DocumentTemplatePayload } from '@interfaces/documents/document-template-payload.interface';
import { TemplatePlaceholder } from '@interfaces/documents/template-placeholder.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Document templates: ready-made (read-only, copy to change) and the user's own; the fields they can name. */
@Injectable({ providedIn: 'root' })
export class DocumentTemplateApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.documentTemplates;

  list(query: ListQuery): Observable<Page<DocumentTemplate>> {
    return this.api.list<DocumentTemplate>(this.path, query);
  }

  placeholders(): Observable<TemplatePlaceholder[]> {
    return this.api.get<TemplatePlaceholder[]>(`${this.path}/placeholders`);
  }

  create(payload: DocumentTemplatePayload): Observable<DocumentTemplate> {
    return this.api.post<DocumentTemplate>(this.path, payload);
  }

  update(id: string, payload: Partial<DocumentTemplatePayload>): Observable<DocumentTemplate> {
    return this.api.put<DocumentTemplate>(`${this.path}/${id}`, payload);
  }

  duplicate(id: string): Observable<DocumentTemplate> {
    return this.api.post<DocumentTemplate>(`${this.path}/${id}/duplicate`);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`${this.path}/${id}`);
  }
}
