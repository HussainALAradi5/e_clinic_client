import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { AccountFormDialog } from '../../components/account-form-dialog/account-form-dialog.component';
import { AccountFormDialogData } from '../../interfaces/dialog-data.interface';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { EntityActions } from '@shared/components/entity-actions/entity-actions.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { Account } from '@shared/interfaces/accounting/account.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AccountApi } from '@shared/services/accounting/account-api.service';
import { EntityDetail } from '@shared/services/data/entity-detail';
import { EnumService } from '@shared/services/data/enum.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { humanise } from '@shared/utils/text';

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
      { label: 'Code', value: a.code, mono: true },
      { label: 'Type', value: this.enums.label('AccountType', a.type) },
      { label: 'Normal balance', value: this.enums.label('BalanceSide', a.normalBalance) },
      { label: 'Kind', value: a.isGroup ? 'Group (not posted to)' : 'Posting account' },
      { label: 'Parent', value: a.parent ? `${a.parent.code} ${a.parent.name}` : 'Top level' },
      { label: 'System account', value: a.isSystem ? 'Yes — cannot be deleted' : 'No' },
      { label: 'Description', value: a.description },
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
    if (saved) this.notify.success('Account saved.');
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success('Account archived — hidden from pickers.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success('Account back in pickers.');
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success('Account restored.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Account deleted.');
    await this.router.navigateByUrl('/accounting/chart-of-accounts');
  };
}
