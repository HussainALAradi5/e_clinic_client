import { ApiError } from '@interfaces/api/api-error.interface';
import { User } from '@interfaces/identity/user.interface';

/** UserStore state. */
export interface UserState {
  user: User | null;
  loading: boolean;
  error: ApiError | null;
}
