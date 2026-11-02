import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { EntityApi } from '@services/api/entity-api.service';
import { Page } from '@interfaces/api/page.interface';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { AttachmentOwner } from '@interfaces/attachment/attachment-owner.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { BackgroundTask } from '@interfaces/task/background-task.interface';
import { SignedLink } from '@interfaces/task/signed-link.interface';
import { openSignedLink } from '@utilities/download';

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

  /** A 5-minute signed link without opening it (printed reports embed the images). */
  link(id: string, inline = true): Observable<SignedLink> {
    return this.api.get<SignedLink>(`${this.path}/${id}/download`, {
      params: inline ? { inline: 1 } : {},
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
