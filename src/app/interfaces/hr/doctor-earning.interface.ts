import { CommissionType } from '@enums/hr/commission-type.enum';
import { Money } from '@interfaces/common/money.interface';

/** GET hr/doctor-earnings: one doctor's month. */
export interface DoctorEarning {
  doctor: { id: string; fullName: string };
  commissionType: CommissionType;
  rate: string;
  revenue: Money;
  visits: number;
  commission: Money;
}
