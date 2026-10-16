import { Gender } from '@shared/enums/shared/gender.enum';
import { UserType } from '@shared/enums/identity/user-type.enum';
import { GenericEntity, Versioned } from '@shared/interfaces/common/generic-entity.interface';
import { Address, AddressPayload } from '@shared/interfaces/reference/address.interface';

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

/** POST /people/duplicates. */
export interface DuplicateCheckPayload {
  nationalId?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  exceptId?: string | null;
}

/** `meta.candidates` of a 409 PERSON_DUPLICATE. */
export interface DuplicateCandidate {
  id: string;
  code: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
}
