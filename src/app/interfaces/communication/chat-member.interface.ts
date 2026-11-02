import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { UserType } from '@enums/identity/user-type.enum';

/** A member of a chat with the badges shown next to their name. */
export interface ChatMember {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  userType: UserType;
  role: ParticipantRole;
  isMe: boolean;
  lastReadAt: string | null;
}
