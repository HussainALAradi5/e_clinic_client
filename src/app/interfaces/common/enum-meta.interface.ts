import { EnumOption } from '@interfaces/common/enum-option.interface';

export interface EnumMeta {
  options: EnumOption[];
  transitions?: Record<string, (string | number)[]>;
}
