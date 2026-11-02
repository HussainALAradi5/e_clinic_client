import { Gender } from '@enums/shared/gender.enum';

/** New person nested in a registration (`person` of POST /patients and POST /hr/employees). */
export interface NewPersonPayload {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  nationalId?: string | null;
  nationalityCode?: string | null;
  phone: string;
  email?: string | null;
}
