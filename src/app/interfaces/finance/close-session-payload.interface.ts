import { Denomination } from '@interfaces/finance/denomination.interface';

export interface CloseSessionPayload {
  countedClosing: string;
  denominations?: Denomination[] | null;
  notes?: string | null;
}
