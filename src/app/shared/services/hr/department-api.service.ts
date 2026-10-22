import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Department, DepartmentPayload } from '@shared/interfaces/hr/department.interface';
import { EntityApi } from '@shared/services/api/entity-api.service';

/** HR › Departments — CRUD, archive / delete / restore, bulk and the tree. */
@Injectable({ providedIn: 'root' })
export class DepartmentApi extends EntityApi<Department, DepartmentPayload> {
  constructor() {
    super('hr/departments');
  }

  tree(): Observable<Department[]> {
    return this.api.get<Department[]>(`${this.path}/tree`);
  }
}
