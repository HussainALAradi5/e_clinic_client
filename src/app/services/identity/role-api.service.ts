import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EffectiveAccess } from '@interfaces/auth/effective-access.interface';
import { AccessRow } from '@interfaces/identity/access-row.interface';
import { PermissionGroup } from '@interfaces/identity/permission-group.interface';
import { ResourceAccess } from '@interfaces/identity/resource-access.interface';
import { Role } from '@interfaces/identity/role.interface';
import { RolePayload } from '@interfaces/identity/role-payload.interface';
import { User } from '@interfaces/identity/user.interface';
import { EntityApi } from '@services/api/entity-api.service';
import { ENDPOINTS } from '@config/endpoints';

/** Identity › Roles & Permissions endpoints (CRUD, archive, bulk from EntityApi). */
@Injectable({ providedIn: 'root' })
export class RoleApi extends EntityApi<Role, RolePayload> {
  constructor() {
    super(ENDPOINTS.roles);
  }

  permissions(): Observable<PermissionGroup[]> {
    return this.api.get<PermissionGroup[]>(`${ENDPOINTS.roles}/permissions`);
  }

  resources(): Observable<ResourceAccess[]> {
    return this.api.get<ResourceAccess[]>(`${ENDPOINTS.roles}/resources`);
  }

  access(id: string): Observable<AccessRow[]> {
    return this.api.get<AccessRow[]>(`${ENDPOINTS.roles}/${id}/access`);
  }

  /** Only the sent rows change; other resources keep their rights. */
  updateAccess(id: string, rows: AccessRow[]): Observable<AccessRow[]> {
    return this.api.put<AccessRow[]>(`${ENDPOINTS.roles}/${id}/access`, { rows });
  }

  myAccess(): Observable<EffectiveAccess> {
    return this.api.get<EffectiveAccess>(`${ENDPOINTS.roles}/me/access`);
  }

  syncUserRoles(userId: string, roles: string[]): Observable<User> {
    return this.api.put<User>(`${ENDPOINTS.roles}/users/${userId}`, { roles });
  }

  /** Gives the role to these people (their other roles stay); returns how many were added. */
  addMembers(id: string, userIds: string[]): Observable<{ added: number }> {
    return this.api.post<{ added: number }>(`${ENDPOINTS.roles}/${id}/members`, { userIds });
  }

  /** Takes the role away from one person; they keep their other roles. */
  removeMember(id: string, userId: string): Observable<void> {
    return this.api.delete(`${ENDPOINTS.roles}/${id}/members/${userId}`);
  }
}
