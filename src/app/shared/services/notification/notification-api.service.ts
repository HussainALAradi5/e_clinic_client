import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { silent } from '@core/interceptors/http-context';
import { Page } from '@shared/interfaces/api/page.interface';
import { BulkActionRequest, BulkResult } from '@shared/interfaces/bulk/bulk.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { DevicePayload } from '@shared/interfaces/notification/device.interface';
import { AppNotification } from '@shared/interfaces/notification/notification.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Identity › Notifications — own in-app inbox, push devices and the delivery log. */
@Injectable({ providedIn: 'root' })
export class NotificationApi {
  private readonly api = inject(ApiClient);

  /** Inbox page; `meta.unreadCount` drives the bell badge. */
  inbox(query: ListQuery, unreadOnly = false, quiet = false): Observable<Page<AppNotification>> {
    return this.api.list<AppNotification>(
      'notifications/mine',
      query,
      { unread: unreadOnly ? 1 : undefined },
      quiet ? silent() : undefined,
    );
  }

  unreadCount(): Observable<number> {
    return this.inbox({ perPage: 1 }, true, true).pipe(map((page) => page.meta.unreadCount ?? 0));
  }

  markRead(id: string): Observable<AppNotification> {
    return this.api.patch<AppNotification>(`notifications/${id}/read`);
  }

  markAllRead(): Observable<{ updated: number }> {
    return this.api.patch<{ updated: number }>('notifications/mine/read-all');
  }

  registerDevice(payload: DevicePayload): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('notifications/devices', payload);
  }

  unregisterDevice(token: string): Observable<void> {
    return this.api.delete(`notifications/devices/${encodeURIComponent(token)}`);
  }

  log(query: ListQuery): Observable<Page<AppNotification>> {
    return this.api.list<AppNotification>('notifications', query);
  }

  get(id: string): Observable<AppNotification> {
    return this.api.get<AppNotification>(`notifications/${id}`);
  }

  resend(id: string): Observable<AppNotification> {
    return this.api.post<AppNotification>(`notifications/${id}/resend`);
  }

  cancel(id: string): Observable<AppNotification> {
    return this.api.patch<AppNotification>(`notifications/${id}/cancel`);
  }

  bulk(request: BulkActionRequest): Observable<BulkResult> {
    return this.api.post<BulkResult>('notifications/bulk', request);
  }
}
