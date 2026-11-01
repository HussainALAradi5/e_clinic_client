import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Shift, ShiftPayload } from '@shared/interfaces/hr/shift.interface';
import { EntityApi } from '@shared/services/api/entity-api.service';

/** HR › Shifts — CRUD and who is on each shift. */
@Injectable({ providedIn: 'root' })
export class ShiftApi extends EntityApi<Shift, ShiftPayload> {
  constructor() {
    super('hr/shifts');
  }

  /** Puts people on this shift (moving them from any other). */
  assign(id: string, employeeIds: string[]): Observable<Shift> {
    return this.api.post<Shift>(`${this.path}/${id}/employees`, { employeeIds });
  }

  unassign(id: string, employeeId: string): Observable<void> {
    return this.api.delete(`${this.path}/${id}/employees/${employeeId}`);
  }
}
