import { UserStatus } from '@shared/enums/identity/user-status.enum';
import { UserType } from '@shared/enums/identity/user-type.enum';
import { Person } from './person.interface';

export interface TwoFactorState {
  enabled: boolean;
  /** One of the user's roles makes 2FA mandatory. */
  required: boolean;
}

export interface UserRoleRef {
  id: string;
  name: string;
  displayName: string;
}

/** Mirror of UserResource — a login account with its person's name and contact data. */
export interface User {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  language: 'en' | 'ar';
  userType: UserType;
  status: UserStatus;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  lockedAt: string | null;
  twoFactor: TwoFactorState;
  roles?: UserRoleRef[];
  /** Detail endpoints only. */
  person?: Person;
}

/** PATCH /users/{user}/status — reason required for locked / inactive. */
export interface ChangeUserStatusPayload {
  status: UserStatus;
  reason?: string | null;
}
