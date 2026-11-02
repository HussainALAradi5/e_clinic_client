import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@interfaces/api/page.interface';
import {
  Attendance,
  AttendanceSummary,
  AttendanceToday,
  ManualAttendancePayload,
} from '@interfaces/hr/attendance.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';

/** HR › Attendance — self check-in / check-out, HR corrections, overtime approval and monthly totals. */
@Injectable({ providedIn: 'root' })
export class AttendanceApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'hr/attendance';

  list(query: ListQuery): Observable<Page<Attendance>> {
    return this.api.list<Attendance>(this.path, query);
  }

  today(): Observable<AttendanceToday> {
    return this.api.get<AttendanceToday>(`${this.path}/today`);
  }

  checkIn(): Observable<Attendance> {
    return this.api.post<Attendance>(`${this.path}/check-in`);
  }

  checkOut(): Observable<Attendance> {
    return this.api.post<Attendance>(`${this.path}/check-out`);
  }

  record(payload: ManualAttendancePayload): Observable<Attendance> {
    return this.api.post<Attendance>(`${this.path}/manual`, payload);
  }

  approveOvertime(id: string): Observable<Attendance> {
    return this.api.patch<Attendance>(`${this.path}/${id}/approve-overtime`);
  }

  summary(employeeId: string, year: number, month: number): Observable<AttendanceSummary> {
    return this.api.get<AttendanceSummary>(`${this.path}/employees/${employeeId}/summary`, {
      params: { year, month },
    });
  }
}
