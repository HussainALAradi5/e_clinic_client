import { Gender } from '@shared/enums/shared/gender.enum';
import { UserType } from '@shared/enums/identity/user-type.enum';
import { GenericEntity, Versioned } from '@shared/interfaces/common/generic-entity.interface';

/** Mirror of PersonResource — the root record of every human (patients and staff). */
export interface Person extends GenericEntity, Versioned {
  firstName: string;
  lastName: string;
  firstNameAr: string | null;
  lastNameAr: string | null;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  /** Masked by the server (`*****6789`). */
  nationalId: string | null;
  nationalityCode: string | null;
  phone: string;
  email: string | null;
  language: 'en' | 'ar';
  notificationOptOut: string[];
  hasAccount?: boolean;
  userType?: UserType | null;
}

/** PUT /people/{person} — only the sent keys change; `version` is the optimistic lock. */
export interface PersonPayload extends Versioned {
  firstName?: string;
  lastName?: string;
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  gender?: Gender;
  dateOfBirth?: string;
  nationalId?: string | null;
  nationalityCode?: string | null;
  phone?: string;
  email?: string | null;
  language?: 'en' | 'ar';
  notificationOptOut?: string[];
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
