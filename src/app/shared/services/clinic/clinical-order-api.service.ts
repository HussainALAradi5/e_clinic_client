import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@core/interceptors/http-context';
import { ClinicalOrderType } from '@shared/enums/clinic/clinical-order-type.enum';
import {
  ClinicalOrder,
  ClinicalOrderPayload,
  OrderResultPayload,
} from '@shared/interfaces/clinic/clinical-order.interface';
import { EntityApi } from '@shared/services/api/entity-api.service';

/** Clinic › Clinical orders — imaging, lab, ECG and referrals: work list, start, result, referral link. */
@Injectable({ providedIn: 'root' })
export class ClinicalOrderApi extends EntityApi<ClinicalOrder, ClinicalOrderPayload> {
  constructor() {
    super('clinical-orders');
  }

  order(payload: ClinicalOrderPayload, idempotencyKey: string): Observable<ClinicalOrder> {
    return this.api.post<ClinicalOrder>(this.path, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  worklist(types: ClinicalOrderType[]): Observable<ClinicalOrder[]> {
    return this.api.get<ClinicalOrder[]>(`${this.path}/worklist`, {
      params: new HttpParams({ fromObject: { 'types[]': types } }),
    });
  }

  start(id: string, roomId: string | null): Observable<ClinicalOrder> {
    return this.api.patch<ClinicalOrder>(`${this.path}/${id}/start`, { roomId });
  }

  complete(id: string, payload: OrderResultPayload): Observable<ClinicalOrder> {
    return this.api.patch<ClinicalOrder>(`${this.path}/${id}/complete`, payload);
  }

  linkReferralAppointment(id: string, appointmentId: string): Observable<ClinicalOrder> {
    return this.api.patch<ClinicalOrder>(`${this.path}/${id}/referral-appointment`, {
      appointmentId,
    });
  }

  cancel(id: string, reason: string): Observable<ClinicalOrder> {
    return this.api.patch<ClinicalOrder>(`${this.path}/${id}/cancel`, { reason });
  }
}
