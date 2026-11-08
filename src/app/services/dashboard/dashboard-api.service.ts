import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';
import { DashboardData } from '@interfaces/dashboard/dashboard-data.interface';
import { Dashboard } from '@interfaces/dashboard/dashboard.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Saved dashboards of any section and their figures. */
@Injectable({ providedIn: 'root' })
export class DashboardApi extends EntityApi<Dashboard> {
  constructor() {
    super(ENDPOINTS.dashboards);
  }

  /** The section's default dashboard, or null when it has none. */
  findDefault(section: DashboardSection): Observable<Dashboard | null> {
    return this.list({
      perPage: 1,
      filter: { and: [{ section: { eq: section } }, { isDefault: { eq: true } }] },
    }).pipe(map((page) => page.data[0] ?? null));
  }

  /** Today's figures of the dashboard's widgets, limited by the server to what this user may see. */
  data(id: string): Observable<DashboardData> {
    return this.api.get<DashboardData>(`${this.path}/${id}/data`);
  }
}
