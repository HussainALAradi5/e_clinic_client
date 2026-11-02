import { UserStatus } from '@enums/identity/user-status.enum';
import { UserType } from '@enums/identity/user-type.enum';
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
  /** Signed, short-lived link to the profile photo (null without one). */
  avatarUrl?: string | null;
  email: string | null;
  phone: string;
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
