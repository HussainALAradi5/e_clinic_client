import { SalaryComponentType } from '@enums/hr/salary-component-type.enum';

/** POST /hr/employees/{id}/salary-components. */
export interface SalaryComponentPayload {
  type: SalaryComponentType;
  name: string;
  amount: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isTaxable?: boolean;
}
