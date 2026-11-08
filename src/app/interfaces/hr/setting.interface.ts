import { SettingKey } from '@enums/hr/setting-key.enum';
import { Money } from '@interfaces/common/money.interface';
import { OvertimeBand } from '@interfaces/hr/overtime-band.interface';

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
  /** Overtime: pay by time of day. */
  bands: OvertimeBand[];
  updatedAt: string | null;
}
