import { OvertimeBandPayload } from '@interfaces/hr/overtime-band-payload.interface';

export interface SettingPayload {
  isEnabled: boolean;
  amount?: string | null;
  bands?: OvertimeBandPayload[];
}
