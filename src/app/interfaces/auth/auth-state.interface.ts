import { User } from '@interfaces/identity/user.interface';

export interface AuthState {
  token: string | null;
  user: User | null;
  roles: string[];
  permissions: string[];
  accessLoaded: boolean;
}
