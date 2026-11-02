import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReplaceSchedulePayload } from '@interfaces/clinic/replace-schedule-payload.interface';
import { ScheduleBlock } from '@interfaces/clinic/schedule.interface';
import { ScheduleException } from '@interfaces/clinic/schedule-exception.interface';
import { ScheduleExceptionPayload } from '@interfaces/clinic/schedule-exception-payload.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Clinic › Provider schedules and clinic-wide holidays (one method per endpoint). */
@Injectable({ providedIn: 'root' })
export class ScheduleApi {
  private readonly api = inject(ApiClient);

  week(providerId: string, onDate?: string): Observable<ScheduleBlock[]> {
    return this.api.get<ScheduleBlock[]>(
      `${ENDPOINTS.providers}/${providerId}/schedules`,
      onDate ? { params: { onDate } } : {},
    );
  }

  replaceWeek(providerId: string, payload: ReplaceSchedulePayload): Observable<ScheduleBlock[]> {
    return this.api.put<ScheduleBlock[]>(`${ENDPOINTS.providers}/${providerId}/schedules`, payload);
  }

  exceptions(providerId: string, from: string, to: string): Observable<ScheduleException[]> {
    return this.api.get<ScheduleException[]>(
      `${ENDPOINTS.providers}/${providerId}/schedules/exceptions`,
      {
        params: { from, to },
      },
    );
  }

  addException(
    providerId: string,
    payload: ScheduleExceptionPayload,
  ): Observable<ScheduleException> {
    return this.api.post<ScheduleException>(
      `${ENDPOINTS.providers}/${providerId}/schedules/exceptions`,
      payload,
    );
  }

  removeException(providerId: string, exceptionId: string): Observable<void> {
    return this.api.delete(
      `${ENDPOINTS.providers}/${providerId}/schedules/exceptions/${exceptionId}`,
    );
  }

  holidays(from: string, to: string): Observable<ScheduleException[]> {
    return this.api.get<ScheduleException[]>(`${ENDPOINTS.schedules}/holidays`, {
      params: { from, to },
    });
  }

  addHoliday(payload: ScheduleExceptionPayload): Observable<ScheduleException> {
    return this.api.post<ScheduleException>(`${ENDPOINTS.schedules}/holidays`, payload);
  }

  removeHoliday(id: string): Observable<void> {
    return this.api.delete(`${ENDPOINTS.schedules}/holidays/${id}`);
  }
}
