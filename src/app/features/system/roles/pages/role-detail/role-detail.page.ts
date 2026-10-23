import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { RoleFormDialog } from '../../components/role-form-dialog/role-form-dialog.component';
import { RoleFormDialogData } from '../../interfaces/role-form-dialog-data.interface';
import { RoleStore } from '../../services/role.store';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { AccessRow, Role } from '@shared/interfaces/identity/role.interface';
import { ConfirmConfig } from '@shared/interfaces/ui/confirm-config.interface';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { humanise, initials } from '@shared/utils/text';

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
    title: 'Delete this role?',
    message: 'It can be restored later from the deleted roles list.',
    confirmLabel: 'Delete',
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
      this.notify.success('Role saved.');
    }
  };

  protected readonly openMatrix = (): Promise<boolean> =>
    this.router.navigate(['/system/roles-permissions', this.id(), 'access']);

  protected readonly archive = async (): Promise<void> => {
    await this.store.archive();
    this.notify.success('Role archived — hidden from pickers.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.store.unarchive();
    this.notify.success('Role restored to pickers.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.store.remove();
    this.notify.success('Role deleted.');
    await this.router.navigateByUrl('/system/roles-permissions');
  };

  protected flags(row: AccessRow): string {
    return [
      row.readAll ? 'Read all' : row.readOwn ? 'Read own' : null,
      row.create ? 'Create' : null,
      row.write ? 'Write' : null,
      row.delete ? 'Delete' : null,
    ]
      .filter((flag) => flag !== null)
      .join(' · ');
  }
}
