import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { CommissionType } from '@enums/hr/commission-type.enum';
import { DoctorEarning } from '@interfaces/hr/doctor-earning.interface';
import { ApiClient } from '@services/api/api-client.service';

/** HR › Doctor earnings — the month's commission per doctor (a doctor sees their own) and each doctor's terms. */
@Injectable({ providedIn: 'root' })
export class DoctorEarningApi {
  private readonly api = inject(ApiClient);

  month(year: number, month: number): Observable<DoctorEarning[]> {
    return this.api.get<DoctorEarning[]>(ENDPOINTS.hr.doctorEarnings, { params: { year, month } });
  }

  setCommission(
    doctorId: string,
    commissionType: CommissionType,
    commissionValue: string | null,
  ): Observable<unknown> {
    return this.api.put(`hr/doctors/${doctorId}/commission`, { commissionType, commissionValue });
  }
}
