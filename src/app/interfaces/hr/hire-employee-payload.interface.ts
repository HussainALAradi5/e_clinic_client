import { UserType } from '@enums/identity/user-type.enum';
import { EmploymentPayload } from '@interfaces/hr/employment-payload.interface';
import { NewPersonPayload } from '@interfaces/identity/new-person-payload.interface';

/** POST /hr/employees — hire an existing person (`personId`) or a new one, with the account to create. */
export interface HireEmployeePayload extends EmploymentPayload {
  personId?: string;
  person?: NewPersonPayload;
  userType: UserType;
  roles: string[];
  canLogin: boolean;
}
