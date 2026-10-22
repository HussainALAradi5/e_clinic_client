import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeStatus } from '@shared/enums/hr/employee-status.enum';
import {
  Employee,
  HireEmployeePayload,
  SalaryComponent,
  SalaryComponentPayload,
  TerminationPayload,
  UpdateEmployeePayload,
} from '@shared/interfaces/hr/employee.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** HR › Employees (one method per endpoint). */
@Injectable({ providedIn: 'root' })
export class EmployeeApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'hr/employees';

  get(id: string): Observable<Employee> {
    return this.api.get<Employee>(`${this.path}/${id}`);
  }

  hire(payload: HireEmployeePayload): Observable<Employee> {
    return this.api.post<Employee>(this.path, payload);
  }

  update(id: string, payload: UpdateEmployeePayload): Observable<Employee> {
    return this.api.put<Employee>(`${this.path}/${id}`, payload);
  }

  terminate(id: string, payload: TerminationPayload): Observable<Employee> {
    return this.api.post<Employee>(`${this.path}/${id}/terminate`, payload);
  }

  changeStatus(id: string, status: EmployeeStatus, reason: string): Observable<Employee> {
    return this.api.patch<Employee>(`${this.path}/${id}/status`, { status, reason });
  }

  addSalaryComponent(id: string, payload: SalaryComponentPayload): Observable<SalaryComponent> {
    return this.api.post<SalaryComponent>(`${this.path}/${id}/salary-components`, payload);
  }

  removeSalaryComponent(componentId: string): Observable<void> {
    return this.api.delete(`${this.path}/salary-components/${componentId}`);
  }
}
