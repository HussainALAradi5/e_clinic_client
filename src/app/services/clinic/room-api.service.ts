import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { Room, RoomPayload, RoomServiceResult } from '@interfaces/clinic/room.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Clinic › Rooms — CRUD, archive / delete / restore, bulk, service switch and the day's bookings. */
@Injectable({ providedIn: 'root' })
export class RoomApi extends EntityApi<Room, RoomPayload> {
  constructor() {
    super('rooms');
  }

  setInService(
    id: string,
    inService: boolean,
    reason?: string | null,
  ): Observable<RoomServiceResult> {
    return this.api.patch<RoomServiceResult>(`${this.path}/${id}/service`, { inService, reason });
  }

  availability(id: string, date: string): Observable<Appointment[]> {
    return this.api.get<Appointment[]>(`${this.path}/${id}/availability`, { params: { date } });
  }
}
