import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AccountingActions } from '@services/accounting/accounting-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { UploadZone } from '@components/common/upload-zone/upload-zone.component';
import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { Expense } from '@interfaces/finance/expense.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { AuthStore } from '@services/auth/auth.store';
import { AttachmentApi } from '@services/attachment/attachment-api.service';
import { EntityDetail } from '@services/data/entity-detail';
import { EnumService } from '@services/data/enum.service';
import { ExpenseApi } from '@services/finance/expense-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicDateTime } from '@utilities/clinic-time';
import { defaultQuery } from '@utilities/list-query';
import { formatMoney } from '@utilities/money';

/** `/accounting/expenses/:id` — the expense, its vendor invoice scans, the next step and history. */
@Component({
  selector: 'app-expense-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    UploadZone,
    HasAccessDirective,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './expense-detail.page.html',
})
export class ExpenseDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(ExpenseApi);
  protected readonly detail = new EntityDetail(this.api);
  private readonly actions = inject(AccountingActions);
  private readonly files = inject(AttachmentApi);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly variants = ButtonVariant;
  protected readonly scans = signal<Attachment[]>([]);
  protected readonly scanCategory = AttachmentCategory.InvoiceScan;
  protected readonly owner = computed(() => ({ type: 'expense', id: this.id() }));
  protected readonly status = computed(() => this.detail.record()?.status);
  protected readonly isDraft = computed(() => this.status() === ApprovalStatus.Draft);
  private readonly me = inject(AuthStore).user;
  /** Pending, and not the submitter (someone else approves). */
  protected readonly isPending = computed(
    () =>
      this.status() === ApprovalStatus.Pending &&
      this.detail.record()?.submittedBy?.id !== this.me()?.id,
  );
  protected readonly toPay = computed(
    () => this.status() === ApprovalStatus.Approved && !this.detail.record()?.isPaid,
  );
  protected readonly cancellable = computed(
    () =>
      !this.detail.record()?.isPaid &&
      [ApprovalStatus.Draft, ApprovalStatus.Pending, ApprovalStatus.Approved].includes(
        this.status() as ApprovalStatus,
      ),
  );
  protected readonly deletable = computed(() =>
    [ApprovalStatus.Draft, ApprovalStatus.Cancelled, ApprovalStatus.Rejected].includes(
      this.status() as ApprovalStatus,
    ),
  );
  protected readonly facts = computed<Fact[]>(() => {
    const e = this.detail.record();
    if (!e) return [];
    return [
      { label: 'Paid to', value: e.payeeName },
      { label: 'Category', value: this.enums.label('ExpenseCategory', e.category) },
      {
        label: 'Account',
        value: e.expenseAccount ? `${e.expenseAccount.code} · ${e.expenseAccount.name}` : null,
      },
      { label: 'Department', value: e.department?.name },
      { label: 'Date', value: e.expenseDate },
      { label: 'Amount', value: formatMoney(e.amount) },
      {
        label: 'Of which VAT',
        value: e.taxAmount.amount !== '0.000' ? formatMoney(e.taxAmount) : null,
      },
      { label: 'Vendor invoice', value: e.vendorInvoiceNumber },
      { label: 'Submitted by', value: e.submittedBy?.fullName },
      {
        label: 'Approved by',
        value: e.approvedBy ? `${e.approvedBy.fullName} · ${clinicDateTime(e.approvedAt)}` : null,
      },
      { label: 'Rejected because', value: e.rejectionReason },
      {
        label: 'Paid',
        value: e.paidAt
          ? `${clinicDateTime(e.paidAt)} · ${this.enums.label('PaymentMethod', e.paymentMethod ?? '')}${e.paymentReference ? ' · ' + e.paymentReference : ''}`
          : null,
      },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  async ngOnInit(): Promise<void> {
    await this.detail.load(this.id());
    await this.loadScans();
  }

  protected async loadScans(): Promise<void> {
    const page = await firstValueFrom(
      this.files.listFor(this.owner(), defaultQuery({ perPage: 50 })),
    ).catch(() => null);
    this.scans.set(page?.data ?? []);
  }

  protected readonly openScan = async (file: Attachment): Promise<void> => {
    await firstValueFrom(this.files.download(file.id, true));
  };

  protected readonly edit = (): Promise<void> => this.step(this.actions.editExpense(this.record()));
  protected readonly submit = (): Promise<void> =>
    this.step(this.actions.submitExpense(this.record()));
  protected readonly approve = (): Promise<void> =>
    this.step(this.actions.approveExpense(this.record()));
  protected readonly reject = (): Promise<void> =>
    this.step(this.actions.rejectExpense(this.record()));
  protected readonly pay = (): Promise<void> => this.step(this.actions.payExpense(this.record()));
  protected readonly cancel = (): Promise<void> =>
    this.step(this.actions.cancelExpense(this.record()));

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Expense deleted.');
    await this.router.navigateByUrl('/accounting/expenses');
  };

  private record(): Expense {
    return this.detail.record() as Expense;
  }

  private async step(action: Promise<Expense | undefined>): Promise<void> {
    if (await action) await this.detail.load(this.id());
  }
}
