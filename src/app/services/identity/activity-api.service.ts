import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { DEFAULT_PER_PAGE } from '@constants/limits.constants';
import { Page } from '@interfaces/api/page.interface';
import { ActivityEntry } from '@interfaces/identity/activity-entry.interface';
import { ActivityRequest } from '@interfaces/identity/activity-request.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Identity › Activity endpoint: the plain-language event log of one record (cursor pagination). */
@Injectable({ providedIn: 'root' })
export class ActivityApi {
  private readonly api = inject(ApiClient);

  forRecord({ entity, recordId, cursor }: ActivityRequest): Observable<Page<ActivityEntry>> {
    return this.api.list<ActivityEntry>(`${ENDPOINTS.activity}/${entity}/${recordId}`, {
      perPage: DEFAULT_PER_PAGE,
      cursor,
    });
  }
}
