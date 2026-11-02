import { SalaryComponentType } from '@enums/hr/salary-component-type.enum';
import { Money } from '@interfaces/common/money.interface';

/** Mirror of SalaryComponentResource — recurring allowance / deduction. */
export interface SalaryComponent {
  id: string;
  code: string;
  type: SalaryComponentType;
  name: string;
  amount: Money;
  effectiveFrom: string;
  effectiveTo: string | null;
  isTaxable: boolean;
}
