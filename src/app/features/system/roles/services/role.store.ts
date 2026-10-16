import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { RoleState } from '../interfaces/role-state.interface';
import { RoleName } from '@shared/enums/identity/role-name.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { AccessRow, Role, RolePayload } from '@shared/interfaces/identity/role.interface';
import { RoleApi } from '@shared/services/identity/role-api.service';

/** Role detail + access matrix state (route-level) with every role action. */
export const RoleStore = signalStore(
  withState<RoleState>({ role: null, matrix: [], loading: false, error: null }),
  withComputed(({ role }) => ({
    /** super_admin keeps every right; its matrix is read-only (server: ROLE_SYSTEM_PROTECTED). */
    readOnlyMatrix: computed(() => role()?.name === RoleName.SuperAdmin),
  })),
  withMethods((store, api = inject(RoleApi)) => {
    const id = (): string => store.role()?.id ?? '';
    const keep = (role: Role): Role => {
      patchState(store, { role });
      return role;
    };

    return {
      async load(roleId: string, withMatrix = false): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const [role, matrix] = await Promise.all([
            firstValueFrom(api.get(roleId)),
            withMatrix ? firstValueFrom(api.access(roleId)) : Promise.resolve(store.matrix()),
          ]);
          patchState(store, { role, matrix, loading: false });
        } catch (error) {
          patchState(store, { loading: false, error: error as ApiError });
        }
      },
      async loadMatrix(): Promise<AccessRow[]> {
        const matrix = await firstValueFrom(api.access(id()));
        patchState(store, { matrix });
        return matrix;
      },
      async saveMatrix(rows: AccessRow[]): Promise<AccessRow[]> {
        const matrix = await firstValueFrom(api.updateAccess(id(), rows));
        patchState(store, { matrix });
        keep(await firstValueFrom(api.get(id())));
        return matrix;
      },
      async update(payload: RolePayload): Promise<Role> {
        return keep(await firstValueFrom(api.update(id(), payload)));
      },
      async archive(): Promise<Role> {
        return keep(await firstValueFrom(api.archive(id())));
      },
      async unarchive(): Promise<Role> {
        return keep(await firstValueFrom(api.unarchive(id())));
      },
      remove(): Promise<void> {
        return firstValueFrom(api.remove(id()));
      },
    };
  }),
);
