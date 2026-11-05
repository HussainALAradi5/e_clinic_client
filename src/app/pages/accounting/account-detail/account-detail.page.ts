import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { AccountFormDialog } from '@components/accounting/account-form-dialog/account-form-dialog.component';
import { AccountFormDialogData } from '@interfaces/accounting/dialog-data.interface';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { EntityActions } from '@components/common/entity-actions/entity-actions.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { HasAccessDirective } from '@directives/has-access.directive';
import { Account } from '@interfaces/accounting/account.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AccountApi } from '@services/accounting/account-api.service';
import { EntityDetail } from '@services/data/entity-detail';
import { EnumService } from '@services/data/enum.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { humanise } from '@utilities/text';
import { ACCOUNT_DETAIL_TEXT } from '@constants/accounting/account-detail.constants';

/** `/accounting/chart-of-accounts/:id` — account facts, child accounts, where it is used, history. */
@Component({
  selector: 'app-account-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    EntityActions,
    ErrorState,
    Skeleton,
    Facts,
    AuditHistory,
    MatCardModule,
    MatTabsModule,
    RouterLink,
    HasAccessDirective,
    EnumLabelPipe,
  ],
  templateUrl: './account-detail.page.html',
})
export class AccountDetailPage implements OnInit {
  protected readonly text = ACCOUNT_DETAIL_TEXT;

  readonly id = input.required<string>();

  protected readonly detail = new EntityDetail(inject(AccountApi));
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly usage = computed(() =>
    Object.entries(this.detail.record()?.usage ?? {}).filter(([, n]) => n > 0),
  );
  protected readonly label = humanise;
  protected readonly facts = computed<Fact[]>(() => {
    const a = this.detail.record();
    if (!a) return [];
    return [
      { label: ACCOUNT_DETAIL_TEXT.code, value: a.code, mono: true },
      { label: ACCOUNT_DETAIL_TEXT.type, value: this.enums.label('AccountType', a.type) },
      {
        label: ACCOUNT_DETAIL_TEXT.normalBalance,
        value: this.enums.label('BalanceSide', a.normalBalance),
      },
      {
        label: ACCOUNT_DETAIL_TEXT.kind,
        value: a.isGroup
          ? ACCOUNT_DETAIL_TEXT.groupNotPostedTo
          : ACCOUNT_DETAIL_TEXT.postingAccount,
      },
      {
        label: ACCOUNT_DETAIL_TEXT.parent,
        value: a.parent ? `${a.parent.code} ${a.parent.name}` : ACCOUNT_DETAIL_TEXT.topLevel,
      },
      {
        label: ACCOUNT_DETAIL_TEXT.systemAccount,
        value: a.isSystem ? ACCOUNT_DETAIL_TEXT.yesCannotBeDeleted : ACCOUNT_DETAIL_TEXT.no,
      },
      { label: ACCOUNT_DETAIL_TEXT.description, value: a.description },
    ];
  });

  ngOnInit(): void {
    void this.detail.load(this.id());
  }

  protected readonly edit = async (): Promise<void> => {
    const saved = await this.dialogs.open<AccountFormDialog, AccountFormDialogData, Account>(
      AccountFormDialog,
      { account: this.detail.record(), save: (payload) => this.detail.update(payload) },
      { width: '640px' },
    );
    if (saved) this.notify.success(ACCOUNT_DETAIL_TEXT.accountSaved);
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success(ACCOUNT_DETAIL_TEXT.accountArchivedHiddenFromPickers);
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success(ACCOUNT_DETAIL_TEXT.accountBackInPickers);
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success(ACCOUNT_DETAIL_TEXT.accountRestored);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success(ACCOUNT_DETAIL_TEXT.accountDeleted);
    await this.router.navigateByUrl('/accounting/chart-of-accounts');
  };
}
