import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SettingKey } from '@enums/hr/setting-key.enum';
import { Page } from '@interfaces/api/page.interface';
import { Setting, SettingPayload } from '@interfaces/hr/setting.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';

/** HR › Settings — the late excuse and overtime switches and the overtime pay per hour (HR and admins). */
@Injectable({ providedIn: 'root' })
export class SettingApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'hr/settings';

  list(query: ListQuery = { perPage: 50 }): Observable<Page<Setting>> {
    return this.api.list<Setting>(this.path, query);
  }

  /** Switches it on / off (and sets the overtime pay per hour); the server creates the row when missing. */
  save(key: SettingKey, payload: SettingPayload): Observable<Setting> {
    return this.api.put<Setting>(`${this.path}/${key}`, payload);
  }
}
