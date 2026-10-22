import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ReplaceSchedulePayload,
  ScheduleBlock,
  ScheduleException,
  ScheduleExceptionPayload,
} from '@shared/interfaces/clinic/schedule.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Clinic › Provider schedules and clinic-wide holidays (one method per endpoint). */
@Injectable({ providedIn: 'root' })
export class ScheduleApi {
  private readonly api = inject(ApiClient);

  week(providerId: string, onDate?: string): Observable<ScheduleBlock[]> {
    return this.api.get<ScheduleBlock[]>(
      `providers/${providerId}/schedules`,
      onDate ? { params: { onDate } } : {},
    );
  }

  replaceWeek(providerId: string, payload: ReplaceSchedulePayload): Observable<ScheduleBlock[]> {
    return this.api.put<ScheduleBlock[]>(`providers/${providerId}/schedules`, payload);
  }

  exceptions(providerId: string, from: string, to: string): Observable<ScheduleException[]> {
    return this.api.get<ScheduleException[]>(`providers/${providerId}/schedules/exceptions`, {
      params: { from, to },
    });
  }

  addException(
    providerId: string,
    payload: ScheduleExceptionPayload,
  ): Observable<ScheduleException> {
    return this.api.post<ScheduleException>(
      `providers/${providerId}/schedules/exceptions`,
      payload,
    );
  }

  removeException(providerId: string, exceptionId: string): Observable<void> {
    return this.api.delete(`providers/${providerId}/schedules/exceptions/${exceptionId}`);
  }

  holidays(from: string, to: string): Observable<ScheduleException[]> {
    return this.api.get<ScheduleException[]>('schedules/holidays', { params: { from, to } });
  }

  addHoliday(payload: ScheduleExceptionPayload): Observable<ScheduleException> {
    return this.api.post<ScheduleException>('schedules/holidays', payload);
  }

  removeHoliday(id: string): Observable<void> {
    return this.api.delete(`schedules/holidays/${id}`);
  }
}
