import { Money } from '@interfaces/common/money.interface';

/** Mirror of one item of SettingResource.bands: overtime pay for a part of the day. */
export interface OvertimeBand {
  start: string;
  end: string;
  rate: Money;
}
