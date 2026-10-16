import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@shared/interfaces/api/page.interface';
import { AuditLog } from '@shared/interfaces/identity/audit-log.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { BackgroundTask } from '@shared/interfaces/task/background-task.interface';
import { ApiClient } from '@shared/services/api/api-client.service';
import { toBulkFilter, toHttpParams } from '@shared/utils/list-query';

/** Identity › Audit Logs endpoints (cursor pagination; a date range is always required). */
@Injectable({ providedIn: 'root' })
export class AuditLogApi {
  private readonly api = inject(ApiClient);

  index(query: ListQuery): Observable<Page<AuditLog>> {
    return this.api.list<AuditLog>('audit-logs', query);
  }

  /** CSV of the filtered trail (needs audit.export) — a background task (202). */
  export(query: ListQuery): Observable<BackgroundTask> {
    return this.api.post<BackgroundTask>(
      'audit-logs/export',
      {},
      { params: toHttpParams(toBulkFilter(query)) },
    );
  }

  /** History tab of one record; `type` is the whitelisted alias (`role`, `user`, `person`, `invoice` …). */
  forModel(type: string, id: string): Observable<AuditLog[]> {
    return this.api.get<AuditLog[]>(`audit-logs/${type}/${id}`);
  }
}
