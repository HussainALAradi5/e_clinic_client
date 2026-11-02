import { UserType } from '@enums/identity/user-type.enum';
import { Gender } from '@enums/shared/gender.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Address } from '@interfaces/reference/address.interface';

/** Mirror of PersonResource — the root record of every human (patients and staff). */
export interface Person extends GenericEntity, Versioned {
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  /** Masked by the server (`*****6789`). */
  nationalId: string | null;
  nationalityCode: string | null;
  /** Detail screens: nationality labels of the code. */
  nationality?: { code: string; nationality: string } | null;
  /** Detail screens: the person's own address. */
  address?: Address | null;
  phone: string;
  email: string | null;
  notificationOptOut: string[];
  hasAccount?: boolean;
  userType?: UserType | null;
}
