import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { Money } from '@shared/interfaces/common/money.interface';

/** Sample row for the UI kit table. */
export interface DemoRow {
  id: string;
  code: string;
  name: string;
  status: GenericStatus;
  price: Money;
  updatedAt: string;
}
