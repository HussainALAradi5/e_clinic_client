import { PayslipItemType } from '@enums/hr/payslip-item-type.enum';
import { Money } from '@interfaces/common/money.interface';

/** A payslip line (positive amount; `isEarning` tells whether it adds or deducts). */
export interface PayslipItem {
  type: PayslipItemType;
  isEarning: boolean;
  name: string;
  amount: Money;
}
