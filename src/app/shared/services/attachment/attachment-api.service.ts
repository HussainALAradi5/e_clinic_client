import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { EntityApi } from '@shared/services/api/entity-api.service';
import { Page } from '@shared/interfaces/api/page.interface';
import { Attachment, AttachmentOwner } from '@shared/interfaces/attachment/attachment.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { BackgroundTask } from '@shared/interfaces/task/background-task.interface';
import { SignedLink } from '@shared/interfaces/task/signed-link.interface';
import { openSignedLink } from '@shared/utils/download';

/**
 * Identity › Attachments — list / archive / delete / restore / bulk (EntityApi), signed downloads and ZIP.
 * Uploading goes through UploadService (multi-file and resumable).
 */
@Injectable({ providedIn: 'root' })
export class AttachmentApi extends EntityApi<Attachment> {
  constructor() {
    super('attachments');
  }

  /** Files of one record (read access to the owner record is enough). */
  listFor(owner: AttachmentOwner, query: ListQuery): Observable<Page<Attachment>> {
    return this.api.list<Attachment>(this.path, query, {
      attachableType: owner.type,
      attachableId: owner.id,
    });
  }

  /** 5-minute signed link (clean files only; sensitive files need patients.view_medical). */
  download(id: string, inline = false): Observable<SignedLink> {
    return this.api
      .get<SignedLink>(`${this.path}/${id}/download`, { params: inline ? { inline: 1 } : {} })
      .pipe(tap((link) => openSignedLink(link, inline)));
  }

  /** ZIP of several files — returns the background task to track. */
  zip(ids: string[]): Observable<BackgroundTask> {
    return this.api.post<BackgroundTask>(`${this.path}/zip`, { attachmentIds: ids });
  }
}
