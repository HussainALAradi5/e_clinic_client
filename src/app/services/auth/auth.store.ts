import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { HOME_PATH, PORTAL_PATH, STORAGE_KEYS } from '@constants/app.constants';
import { UserType } from '@enums/identity/user-type.enum';
import { AuthState } from '@interfaces/auth/auth-state.interface';
import { EffectiveAccess } from '@interfaces/auth/effective-access.interface';
import { Session } from '@interfaces/auth/session.interface';
import { User } from '@interfaces/identity/user.interface';

function readToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.token);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  try {
    token === null
      ? sessionStorage.removeItem(STORAGE_KEYS.token)
      : sessionStorage.setItem(STORAGE_KEYS.token, token);
  } catch {
    /* storage unavailable (private mode) — the token stays in memory only */
  }
}

/**
 * Session state: bearer token in memory + sessionStorage (never localStorage), user and effective access.
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    token: readToken(),
    user: null,
    roles: [],
    permissions: [],
    accessLoaded: false,
  }),
  withComputed(({ token, permissions, user }) => ({
    isAuthenticated: computed(() => token() !== null),
    /** Portal patient: works in `/portal`, never in the staff workspace. */
    isPatient: computed(() => user()?.userType === UserType.Patient),
    grantedPermissions: computed(() => new Set(permissions())),
    /** A privileged role without confirmed 2FA (server answers 403 AUTH_2FA_REQUIRED on protected endpoints). */
    needsTwoFactorSetup: computed(() => {
      const twoFactor = user()?.twoFactor;
      return twoFactor !== undefined && twoFactor.required && !twoFactor.enabled;
    }),
  })),
  withComputed(({ isPatient }) => ({
    /** Where a signed-in user starts: the portal for patients, the dashboard for staff. */
    homePath: computed(() => (isPatient() ? PORTAL_PATH : HOME_PATH)),
  })),
  withMethods((store) => ({
    /** Sign-in response (token + user + access) or GET /auth/me (user + access, token unchanged). */
    setSession(session: Session): void {
      const token = session.token ?? store.token();
      writeToken(token);
      patchState(store, {
        token,
        user: session.user,
        roles: session.roles,
        permissions: session.permissions,
        accessLoaded: true,
      });
    },
    setUser(user: User): void {
      patchState(store, { user });
    },
    setAccess(access: EffectiveAccess): void {
      patchState(store, {
        roles: access.roles,
        permissions: access.permissions,
        accessLoaded: true,
      });
    },
    clear(): void {
      writeToken(null);
      patchState(store, {
        token: null,
        user: null,
        roles: [],
        permissions: [],
        accessLoaded: false,
      });
    },
  })),
);
