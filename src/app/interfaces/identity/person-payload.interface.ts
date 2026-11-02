import { Gender } from '@enums/shared/gender.enum';
import { Versioned } from '@interfaces/common/versioned.interface';
import { AddressPayload } from '@interfaces/reference/address-payload.interface';

/** PUT /people/{person} — only the sent keys change; `version` is the optimistic lock. */
export interface PersonPayload extends Versioned {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  nationalId?: string | null;
  nationalityCode?: string | null;
  phone?: string;
  email?: string | null;
  notificationOptOut?: string[];
  /** Shared address payload; `null` removes the address. */
  address?: AddressPayload | null;
}
