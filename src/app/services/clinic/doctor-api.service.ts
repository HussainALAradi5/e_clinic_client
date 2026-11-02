import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Doctor,
  DoctorPayload,
  Specialty,
  SpecialtyPayload,
} from '@interfaces/clinic/doctor.interface';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';
import { EntityApi } from '@services/api/entity-api.service';

/** Clinic › Doctors (one method per endpoint). */
@Injectable({ providedIn: 'root' })
export class DoctorApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'doctors';

  list(query: ListQuery): Observable<Page<Doctor>> {
    return this.api.list<Doctor>(this.path, query);
  }

  get(id: string): Observable<Doctor> {
    return this.api.get<Doctor>(`${this.path}/${id}`);
  }

  create(payload: DoctorPayload): Observable<Doctor> {
    return this.api.post<Doctor>(this.path, payload);
  }

  update(id: string, payload: DoctorPayload): Observable<Doctor> {
    return this.api.put<Doctor>(`${this.path}/${id}`, payload);
  }

  setAccepting(id: string, accepting: boolean): Observable<Doctor> {
    return this.api.patch<Doctor>(`${this.path}/${id}/accepting`, { accepting });
  }
}

/** Clinic › Specialties — CRUD, archive / delete / restore and bulk (EntityApi). */
@Injectable({ providedIn: 'root' })
export class SpecialtyApi extends EntityApi<Specialty, SpecialtyPayload> {
  constructor() {
    super('doctors/specialties');
  }
}
