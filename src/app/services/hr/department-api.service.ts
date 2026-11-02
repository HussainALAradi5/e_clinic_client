import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Department } from '@interfaces/hr/department.interface';
import { DepartmentPayload } from '@interfaces/hr/department-payload.interface';
import { EntityApi } from '@services/api/entity-api.service';
import { ENDPOINTS } from '@config/endpoints';

/** HR › Departments — CRUD, archive / delete / restore, bulk and the tree. */
@Injectable({ providedIn: 'root' })
export class DepartmentApi extends EntityApi<Department, DepartmentPayload> {
  constructor() {
    super(ENDPOINTS.hr.departments);
  }

  tree(): Observable<Department[]> {
    return this.api.get<Department[]>(`${this.path}/tree`);
  }
}
