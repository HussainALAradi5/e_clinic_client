import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeStatus } from '@enums/hr/employee-status.enum';
import { Employee } from '@interfaces/hr/employee.interface';
import { HireEmployeePayload } from '@interfaces/hr/hire-employee-payload.interface';
import { SalaryComponent } from '@interfaces/hr/salary-component.interface';
import { SalaryComponentPayload } from '@interfaces/hr/salary-component-payload.interface';
import { TerminationPayload } from '@interfaces/hr/termination-payload.interface';
import { UpdateEmployeePayload } from '@interfaces/hr/update-employee-payload.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** HR › Employees (one method per endpoint). */
@Injectable({ providedIn: 'root' })
export class EmployeeApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.hr.employees;

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
