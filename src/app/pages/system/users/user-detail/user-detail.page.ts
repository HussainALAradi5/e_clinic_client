import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ChangeStatusDialog } from '@components/system/users/change-status-dialog/change-status-dialog.component';
import { PersonFormDialog } from '@components/system/users/person-form-dialog/person-form-dialog.component';
import { UserRolesDialog } from '@components/system/users/user-roles-dialog/user-roles-dialog.component';
import {
  ChangeStatusDialogData,
  PersonFormDialogData,
  UserRolesDialogData,
} from '@interfaces/system/users/dialog-data.interface';
import { UserStore } from '@services/system/users/user.store';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { Flag } from '@components/common/flag/flag.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ConfirmConfig } from '@interfaces/ui/confirm-config.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';

/** `/system/users/:id` — account + personal data, status / roles / reset-link actions and the audit history. */
@Component({
  selector: 'app-user-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserStore],
  imports: [
    Flag,
    PageHeader,
    StatusChip,
    AppButton,
    Skeleton,
    ErrorState,
    AuditHistory,
    HasAccessDirective,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    EnumLabelPipe,
  ],
  templateUrl: './user-detail.page.html',
})
export class UserDetailPage implements OnInit {
  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly store = inject(UserStore);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);

  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly resetConfirm: ConfirmConfig = {
    title: 'Send a password reset link?',
    message:
      'The user receives an email to choose a new password. Administrators never see passwords.',
    confirmLabel: 'Send link',
  };

  ngOnInit(): void {
    void this.store.load(this.id());
  }

  protected readonly sendResetLink = async (): Promise<void> => {
    await this.store.sendResetLink();
    this.notify.success('Reset link sent.');
  };

  protected readonly changeStatus = async (): Promise<void> => {
    const user = this.store.user();
    if (user) {
      const changed = await this.dialogs.open<ChangeStatusDialog, ChangeStatusDialogData, boolean>(
        ChangeStatusDialog,
        {
          user,
          save: (payload) => this.store.changeStatus(payload),
        },
      );
      if (changed) {
        this.notify.success(`Account status of ${user.fullName} changed.`);
      }
    }
  };

  protected readonly editPerson = async (): Promise<void> => {
    const person = this.store.user()?.person;
    if (person) {
      const saved = await this.dialogs.open<PersonFormDialog, PersonFormDialogData, boolean>(
        PersonFormDialog,
        { person, save: (payload) => this.store.updatePerson(payload) },
        { width: '720px' },
      );
      if (saved) {
        this.notify.success('Personal data saved.');
      }
    }
  };

  protected readonly editRoles = async (): Promise<void> => {
    await this.dialogs.open<UserRolesDialog, UserRolesDialogData, boolean>(UserRolesDialog, {
      current: this.store.roleNames(),
      save: (roles) => this.store.syncRoles(roles),
    });
  };
}
