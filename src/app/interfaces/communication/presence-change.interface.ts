import { PresenceStatus } from '@enums/identity/presence-status.enum';

/** Socket `presence.changed` on `staff.presence`: a colleague went Online or Offline. */
export interface PresenceChange {
  userId: string;
  presence: PresenceStatus;
  at: string;
}
