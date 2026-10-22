import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { AccountingActions } from '../../services/accounting-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { JournalEntryStatus } from '@shared/enums/accounting/journal-entry-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { JournalApi } from '@shared/services/accounting/journal-api.service';
import { EntityDetail } from '@shared/services/data/entity-detail';
import { EnumService } from '@shared/services/data/enum.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { clinicDateTime } from '@shared/utils/clinic-time';

/** Pages of the documents automatic entries are posted for. */
const SOURCE_PAGES: Record<string, { label: string; route: string }> = {
  invoice: { label: 'Invoice', route: '/billing/invoices' },
  cash_session: { label: 'Cash drawer', route: '/billing/cash-drawers' },
  expense: { label: 'Expense', route: '/accounting/expenses' },
};

/** `/accounting/journal/:id` — one entry: its lines, where it came from, and post / reverse / edit a draft. */
@Component({
  selector: 'app-journal-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    MoneyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './journal-detail.page.html',
})
export class JournalDetailPage implements OnInit {
  readonly id = input.required<string>();

  protected readonly detail = new EntityDetail(inject(JournalApi));
  private readonly actions = inject(AccountingActions);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly isDraft = computed(
    () => this.detail.record()?.status === JournalEntryStatus.Draft,
  );
  protected readonly reversible = computed(() => {
    const e = this.detail.record();
    return !!e && e.isManual && e.status === JournalEntryStatus.Posted;
  });
  protected readonly source = computed(() => {
    const e = this.detail.record();
    const page = e?.sourceType ? SOURCE_PAGES[e.sourceType] : undefined;
    return page && e?.sourceId ? { label: page.label, link: [page.route, e.sourceId] } : null;
  });
  protected readonly facts = computed<Fact[]>(() => {
    const e = this.detail.record();
    if (!e) return [];
    return [
      { label: 'Kind', value: this.enums.label('JournalEntryType', e.type) },
      {
        label: 'Period',
        value: e.fiscalPeriod ? `${e.fiscalPeriod.name} (${e.fiscalPeriod.status})` : null,
      },
      {
        label: 'Written by',
        value: e.createdBy?.fullName ?? (e.isManual ? null : 'Posted automatically'),
      },
      {
        label: 'Posted',
        value: e.postedAt
          ? `${clinicDateTime(e.postedAt)} · ${e.postedBy?.fullName ?? 'system'}`
          : null,
      },
      { label: 'Reverses', value: e.reversalOf?.entryNumber },
      { label: 'Reversed by', value: e.reversedBy?.entryNumber },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  ngOnInit(): void {
    void this.detail.load(this.id());
  }

  protected readonly edit = async (): Promise<void> => {
    const e = this.detail.record();
    if (e && (await this.actions.editEntry(e))) await this.detail.load(this.id());
  };

  protected readonly post = async (): Promise<void> => {
    const e = this.detail.record();
    if (e && (await this.actions.postEntry(e))) await this.detail.load(this.id());
  };

  protected readonly reverse = async (): Promise<void> => {
    const e = this.detail.record();
    const reversal = e ? await this.actions.reverseEntry(e) : undefined;
    if (reversal) await this.router.navigate(['/accounting/journal', reversal.id]);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Draft entry deleted.');
    await this.router.navigateByUrl('/accounting/journal');
  };
}
