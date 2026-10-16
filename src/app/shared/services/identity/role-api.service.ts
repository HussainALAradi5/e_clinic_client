import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EffectiveAccess } from '@shared/interfaces/auth/session.interface';
import {
  AccessRow,
  PermissionGroup,
  ResourceAccess,
  Role,
  RolePayload,
} from '@shared/interfaces/identity/role.interface';
import { User } from '@shared/interfaces/identity/user.interface';
import { EntityApi } from '@shared/services/api/entity-api.service';

/** Identity › Roles & Permissions endpoints (CRUD, archive, bulk from EntityApi). */
@Injectable({ providedIn: 'root' })
export class RoleApi extends EntityApi<Role, RolePayload> {
  constructor() {
    super('roles');
  }

  permissions(): Observable<PermissionGroup[]> {
    return this.api.get<PermissionGroup[]>('roles/permissions');
  }

  resources(): Observable<ResourceAccess[]> {
    return this.api.get<ResourceAccess[]>('roles/resources');
  }

  access(id: string): Observable<AccessRow[]> {
    return this.api.get<AccessRow[]>(`roles/${id}/access`);
  }

  /** Only the sent rows change; other resources keep their rights. */
  updateAccess(id: string, rows: AccessRow[]): Observable<AccessRow[]> {
    return this.api.put<AccessRow[]>(`roles/${id}/access`, { rows });
  }

  myAccess(): Observable<EffectiveAccess> {
    return this.api.get<EffectiveAccess>('roles/me/access');
  }

  syncUserRoles(userId: string, roles: string[]): Observable<User> {
    return this.api.put<User>(`roles/users/${userId}`, { roles });
  }
}
