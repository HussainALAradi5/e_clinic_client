import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  viewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { AddMembersDialog } from '@components/system/roles/add-members-dialog/add-members-dialog.component';
import { RoleFormDialog } from '@components/system/roles/role-form-dialog/role-form-dialog.component';
import { AddMembersDialogData } from '@interfaces/system/roles/add-members-dialog-data.interface';
import { RoleFormDialogData } from '@interfaces/system/roles/role-form-dialog-data.interface';
import { RoleStore } from '@services/system/roles/role.store';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { RelativeTimePipe } from '@pipes/relative-time.pipe';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { ButtonVariant } from '@enums/ui/button.enum';
import { AccessRow } from '@interfaces/identity/access-row.interface';
import { Role } from '@interfaces/identity/role.interface';
import { User } from '@interfaces/identity/user.interface';
import { ConfirmConfig } from '@interfaces/ui/confirm-config.interface';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { humanise, initials } from '@utilities/text';
import { ROLE_DETAIL_TEXT } from '@constants/system/role-detail.constants';

/** `/system/roles-permissions/:id` — role facts, granted rights (read-only), lifecycle actions and history. */
@Component({
  selector: 'app-role-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoleStore],
  imports: [
    PageHeader,
    AppButton,
    Skeleton,
    ErrorState,
    AuditHistory,
    HasAccessDirective,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    RouterLink,
    ResourceListPage,
    CellDef,
    RelativeTimePipe,
  ],
  templateUrl: './role-detail.page.html',
})
export class RoleDetailPage implements OnInit {
  readonly id = input.required<string>();
  /** `?tab=members` opens the Members tab (the users count on the roles list links here). */
  readonly tab = input<string | undefined>();

  protected readonly store = inject(RoleStore);
  private readonly members = viewChild<ResourceListPage>('members');
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly variants = ButtonVariant;
  protected readonly humanise = humanise;
  protected readonly initials = initials;
  protected readonly memberColumns = ['full_name', 'email', 'user_type', 'status', 'last_login_at'];
  /** Resources with at least one right, for the read-only Access tab. */
  protected readonly granted = computed(() =>
    this.store
      .matrix()
      .filter(
        (row) =>
          row.readOwn || row.readAll || row.create || row.write || row.delete || row.actions.length,
      ),
  );
  protected readonly deleteConfirm: ConfirmConfig = {
    title: ROLE_DETAIL_TEXT.deleteThisRole,
    message: ROLE_DETAIL_TEXT.itCanBeRestoredLater,
    confirmLabel: ROLE_DETAIL_TEXT.delete,
    danger: true,
  };

  ngOnInit(): void {
    void this.store.load(this.id(), true);
  }

  protected readonly edit = async (): Promise<void> => {
    const role = this.store.role();
    const saved = await this.dialogs.open<RoleFormDialog, RoleFormDialogData, Role>(
      RoleFormDialog,
      {
        role,
        save: (payload) => this.store.update(payload),
      },
    );
    if (saved) {
      this.notify.success(ROLE_DETAIL_TEXT.roleSaved);
    }
  };

  protected readonly openMatrix = (): Promise<boolean> =>
    this.router.navigate(['/system/roles-permissions', this.id(), 'access']);

  protected readonly archive = async (): Promise<void> => {
    await this.store.archive();
    this.notify.success(ROLE_DETAIL_TEXT.roleArchivedHiddenFromPickers);
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.store.unarchive();
    this.notify.success(ROLE_DETAIL_TEXT.roleRestoredToPickers);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.store.remove();
    this.notify.success(ROLE_DETAIL_TEXT.roleDeleted);
    await this.router.navigateByUrl('/system/roles-permissions');
  };

  protected readonly addMembers = async (): Promise<void> => {
    const role = this.store.role();
    if (!role) return;
    const added = await this.dialogs.open<AddMembersDialog, AddMembersDialogData, number>(
      AddMembersDialog,
      { role, add: (userIds) => this.store.addMembers(userIds) },
      { width: '560px' },
    );
    if (added !== undefined) {
      this.notify.success(
        added === 1
          ? `1 person now has the ${role.displayName} role.`
          : `${added} people now have the ${role.displayName} role.`,
      );
      this.members()?.reload();
    }
  };

  protected removeConfirm(user: User): ConfirmConfig {
    return {
      title: ROLE_DETAIL_TEXT.removeFrom(user.fullName, this.store.role()?.displayName),
      message: ROLE_DETAIL_TEXT.theyKeepTheirOtherRoles,
      confirmLabel: ROLE_DETAIL_TEXT.remove,
      danger: true,
    };
  }

  protected removeMember(user: User): () => Promise<void> {
    return async () => {
      await this.store.removeMember(user.id);
      this.notify.success(`${user.fullName} no longer has this role.`);
      this.members()?.reload();
    };
  }

  protected flags(row: AccessRow): string {
    return [
      row.readAll ? ROLE_DETAIL_TEXT.readAll : row.readOwn ? ROLE_DETAIL_TEXT.readOwn : null,
      row.create ? ROLE_DETAIL_TEXT.create : null,
      row.write ? ROLE_DETAIL_TEXT.write : null,
      row.delete ? ROLE_DETAIL_TEXT.delete : null,
    ]
      .filter((flag) => flag !== null)
      .join(' · ');
  }
}
