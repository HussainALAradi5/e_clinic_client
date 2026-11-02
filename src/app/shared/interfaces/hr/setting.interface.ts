import { SettingKey } from '@shared/enums/hr/setting-key.enum';
import { Money } from '@shared/interfaces/common/money.interface';

/** Mirror of SettingResource — one HR switch. */
export interface Setting {
  id: string;
  code: string;
  key: SettingKey;
  label: string;
  /** What switching it on changes. */
  description: string;
  isEnabled: boolean;
  /** Overtime: carries the pay per hour. */
  hasAmount: boolean;
  amount: Money | null;
  updatedAt: string | null;
}

export interface SettingPayload {
  isEnabled: boolean;
  amount?: string | null;
}
