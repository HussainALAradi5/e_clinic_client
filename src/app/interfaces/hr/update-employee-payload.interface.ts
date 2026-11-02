import { EmploymentPayload } from '@interfaces/hr/employment-payload.interface';

/** PUT /hr/employees/{id}. */
export interface UpdateEmployeePayload extends EmploymentPayload {
  version: number;
}
