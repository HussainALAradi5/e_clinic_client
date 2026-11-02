import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, EMPTY, expand, filter, last, map, Observable, of, switchMap } from 'rxjs';
import { UploadQueue } from './upload-queue';
import { UPLOAD_LIMITS } from '@constants/limits.constants';
import { ApiEnvelope } from '@interfaces/api/api-envelope.interface';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { UploadResult } from '@interfaces/attachment/upload-result.interface';
import { UploadSession } from '@interfaces/attachment/upload-session.interface';
import { UploadItem } from '@interfaces/upload/upload.interface';
import { UploadQueueOptions } from '@interfaces/upload/upload-queue-options.interface';
import { ApiClient } from '@services/api/api-client.service';

/**
 * Upload pipeline: files ≤ 20 MB go to POST /attachments with progress; larger files use resumable 5 MB chunks
 * (POST /attachments/uploads → PATCH chunks with Upload-Offset → POST …/complete) with pause / resume.
 * Up to 3 uploads run in parallel. Each UploadZone owns one queue.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiClient);

  createQueue(options: UploadQueueOptions): UploadQueue {
    return new UploadQueue(options, this);
  }

  /** @internal */
  direct(
    file: File,
    options: UploadQueueOptions,
    progress: (pct: number) => void,
  ): Observable<Attachment> {
    const form = new FormData();
    form.append('files[]', file, file.name);
    form.append('category', options.category);
    form.append('attachable_type', options.owner.type);
    form.append('attachable_id', options.owner.id);

    return this.http
      .post<ApiEnvelope<UploadResult>>('attachments', form, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            progress(Math.round((event.loaded / event.total) * 100));
          }
          return event;
        }),
        filter((event) => event.type === HttpEventType.Response),
        map((event) => {
          const result = (event as { body: ApiEnvelope<UploadResult> }).body.data;
          if (result.saved[0]) {
            return result.saved[0];
          }
          throw new Error(result.failed[0]?.message ?? 'Upload failed.');
        }),
      );
  }

  /** @internal Starts (or resumes) a resumable upload from the server's received_bytes. */
  resumable(
    item: UploadItem,
    options: UploadQueueOptions,
    onSession: (id: string) => void,
    progress: (pct: number) => void,
  ): Observable<Attachment> {
    const session$ = item.sessionId
      ? this.api.get<UploadSession>(`attachments/uploads/${item.sessionId}`)
      : this.api.post<UploadSession>('attachments/uploads', {
          fileName: item.file.name,
          mimeType: item.file.type || 'application/octet-stream',
          sizeBytes: item.file.size,
          category: options.category,
        });

    return session$.pipe(
      switchMap((session) => {
        onSession(session.id);
        return of(session).pipe(
          expand((s) => (s.receivedBytes < item.file.size ? this.sendChunk(s, item.file) : EMPTY)),
          map((s) => {
            progress(Math.round((s.receivedBytes / item.file.size) * 100));
            return s;
          }),
          last(),
        );
      }),
      concatMap((session) =>
        this.api.post<Attachment>(`attachments/uploads/${session.id}/complete`, {
          attachableType: options.owner.type,
          attachableId: options.owner.id,
        }),
      ),
    );
  }

  /** @internal */
  cancelSession(sessionId: string): void {
    this.api.delete(`attachments/uploads/${sessionId}`).subscribe({ error: () => undefined });
  }

  private sendChunk(session: UploadSession, file: File): Observable<UploadSession> {
    const chunk = file.slice(
      session.receivedBytes,
      session.receivedBytes + (session.chunkSize || UPLOAD_LIMITS.chunkBytes),
    );
    const headers = new HttpHeaders({
      'Upload-Offset': String(session.receivedBytes),
      'Content-Type': 'application/offset+octet-stream',
    });
    return this.http
      .patch<ApiEnvelope<UploadSession>>(`attachments/uploads/${session.id}`, chunk, { headers })
      .pipe(map((res) => res.data));
  }
}
