import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { UserState } from '../interfaces/user-state.interface';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { PersonPayload } from '@shared/interfaces/identity/person.interface';
import { ChangeUserStatusPayload, User } from '@shared/interfaces/identity/user.interface';
import { AuthStore } from '@shared/services/auth/auth.store';
import { RoleApi } from '@shared/services/identity/role-api.service';
import { UserApi } from '@shared/services/identity/user-api.service';

/** User detail state (route-level): the account with its person, plus every action of the detail page. */
export const UserStore = signalStore(
  withState<UserState>({ user: null, loading: false, error: null }),
  withComputed(({ user }, auth = inject(AuthStore)) => ({
    /** Users never change their own status or roles (server: USER_CANNOT_MODIFY_SELF). */
    isSelf: computed(() => user()?.id === auth.user()?.id),
    roleNames: computed(() => user()?.roles?.map((role) => role.name) ?? []),
  })),
  withMethods((store, users = inject(UserApi), roles = inject(RoleApi)) => {
    const keep = (user: User): User => {
      patchState(store, { user });
      return user;
    };
    const id = (): string => store.user()?.id ?? '';
    const load = async (userId: string): Promise<void> => {
      patchState(store, { loading: true, error: null });
      try {
        patchState(store, { user: await firstValueFrom(users.show(userId)), loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: error as ApiError });
      }
    };

    return {
      load,
      async changeStatus(payload: ChangeUserStatusPayload): Promise<User> {
        return keep(await firstValueFrom(users.changeStatus(id(), payload)));
      },
      sendResetLink(): Promise<void> {
        return firstValueFrom(users.sendResetLink(id()));
      },
      async updatePerson(payload: PersonPayload): Promise<void> {
        await firstValueFrom(users.updatePerson(id(), payload));
        await load(id());
      },
      async syncRoles(names: string[]): Promise<User> {
        return keep(await firstValueFrom(roles.syncUserRoles(id(), names)));
      },
    };
  }),
);
