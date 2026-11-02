import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { silent } from '@middlewares/interceptors/http-context';
import { Page } from '@interfaces/api/page.interface';
import { BulkActionRequest } from '@interfaces/bulk/bulk.interface';
import { BulkResult } from '@interfaces/bulk/bulk-result.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { DevicePayload } from '@interfaces/notification/device.interface';
import { AppNotification } from '@interfaces/notification/notification.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Identity › Notifications — own in-app inbox, push devices and the delivery log. */
@Injectable({ providedIn: 'root' })
export class NotificationApi {
  private readonly api = inject(ApiClient);

  /**
   * My in-app notifications, unread first; filters, search, dates and paging on the server. `read` narrows to
   * unread or read ones; `meta.unreadCount` drives the bell badge.
   */
  inbox(
    query: ListQuery,
    read: 'unread' | 'read' | null = null,
    quiet = false,
  ): Observable<Page<AppNotification>> {
    return this.api.list<AppNotification>(
      `${ENDPOINTS.notifications}/mine`,
      query,
      { read },
      quiet ? silent() : undefined,
    );
  }

  unreadCount(): Observable<number> {
    return this.inbox({ perPage: 1 }, 'unread', true).pipe(
      map((page) => page.meta.unreadCount ?? 0),
    );
  }

  markRead(id: string): Observable<AppNotification> {
    return this.api.patch<AppNotification>(`${ENDPOINTS.notifications}/${id}/read`);
  }

  markAllRead(): Observable<{ updated: number }> {
    return this.api.patch<{ updated: number }>(`${ENDPOINTS.notifications}/mine/read-all`);
  }

  registerDevice(payload: DevicePayload): Observable<{ id: string }> {
    return this.api.post<{ id: string }>(`${ENDPOINTS.notifications}/devices`, payload);
  }

  unregisterDevice(token: string): Observable<void> {
    return this.api.delete(`${ENDPOINTS.notifications}/devices/${encodeURIComponent(token)}`);
  }

  log(query: ListQuery): Observable<Page<AppNotification>> {
    return this.api.list<AppNotification>(ENDPOINTS.notifications, query);
  }

  get(id: string): Observable<AppNotification> {
    return this.api.get<AppNotification>(`${ENDPOINTS.notifications}/${id}`);
  }

  resend(id: string): Observable<AppNotification> {
    return this.api.post<AppNotification>(`${ENDPOINTS.notifications}/${id}/resend`);
  }

  cancel(id: string): Observable<AppNotification> {
    return this.api.patch<AppNotification>(`${ENDPOINTS.notifications}/${id}/cancel`);
  }

  bulk(request: BulkActionRequest): Observable<BulkResult> {
    return this.api.post<BulkResult>(`${ENDPOINTS.notifications}/bulk`, request);
  }
}
