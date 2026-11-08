import { PresenceStatus } from '@enums/identity/presence-status.enum';
import { TimeFormat } from '@enums/identity/time-format.enum';
import { UserStatus } from '@enums/identity/user-status.enum';
import { UserType } from '@enums/identity/user-type.enum';
import { Person } from '@interfaces/identity/person.interface';
import { TwoFactorState } from '@interfaces/identity/two-factor-state.interface';
import { UserRoleRef } from '@interfaces/identity/user-role-ref.interface';

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
  /** How this person reads times; 12-hour unless they chose otherwise. */
  timeFormat?: TimeFormat;
  userType: UserType;
  status: UserStatus;
  /** Online / Offline in chat (Online on sign-in, switchable). */
  presence: PresenceStatus;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  lockedAt: string | null;
  twoFactor: TwoFactorState;
  roles?: UserRoleRef[];
  /** Detail endpoints only. */
  person?: Person;
}
