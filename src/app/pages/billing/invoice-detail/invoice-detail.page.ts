import { dateTimeFormat } from '@utilities/clock-format';
import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BillingActions } from '@services/billing/billing-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { DiscountType } from '@enums/billing/discount-type.enum';
import { InvoiceStatus, PAYABLE_INVOICE_STATUSES } from '@enums/billing/invoice-status.enum';
import { PaymentStatus } from '@enums/billing/payment-status.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { InvoiceItem } from '@interfaces/billing/invoice-item.interface';
import { Payment } from '@interfaces/billing/payment.interface';
import { Refund } from '@interfaces/billing/refund.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { EntityDetail } from '@services/data/entity-detail';
import { clinicIsoDate } from '@utilities/clinic-time';
import { toMinor } from '@utilities/money';
import { INVOICE_DETAIL_TEXT } from '@constants/billing/invoice-detail.constants';

/** Where a line came from, as a link (visit or order). */
const SOURCE_ROUTES: Record<string, string> = {
  appointment: '/clinic/appointments',
  clinical_order: '/clinic/clinical-orders',
};

/**
 * `/billing/invoices/:id` — the bill as the patient sees it: lines, totals and balance; the next step (edit and
 * issue a draft, take payment); payments with receipt, void and refund; refunds with their approval.
 */
import { InvoicePaidBar } from '@components/billing/invoice-paid-bar/invoice-paid-bar.component';
import { InvoiceCoverage } from '@components/billing/invoice-coverage/invoice-coverage.component';
import { REMINDER_TEXT } from '@constants/billing/reminder.constants';
@Component({
  selector: 'app-invoice-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InvoicePaidBar,
    InvoiceCoverage,
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
    RouterLink,
  ],
  templateUrl: './invoice-detail.page.html',
})
export class InvoiceDetailPage implements OnInit {
  protected readonly text = INVOICE_DETAIL_TEXT;

  readonly id = input.required<string>();

  protected readonly detail = new EntityDetail(inject(InvoiceApi));
  private readonly actions = inject(BillingActions);

  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = dateTimeFormat;
  protected readonly discountTypes = DiscountType;

  protected readonly isDraft = computed(() => this.detail.record()?.status === InvoiceStatus.Draft);
  protected readonly payable = computed(() => {
    const i = this.detail.record();
    return !!i && PAYABLE_INVOICE_STATUSES.includes(i.status);
  });
  /** A draft, or an issued invoice nobody has paid yet (the server refuses one with payments). */
  protected readonly cancellable = computed(() => {
    const i = this.detail.record();
    return (
      !!i &&
      i.status !== InvoiceStatus.Cancelled &&
      (toMinor(i.paidAmount.amount) ?? 0n) === 0n &&
      i.status !== InvoiceStatus.Paid
    );
  });
  /** Insured patient, money still owed, no claim open or approved. */
  protected readonly claimable = computed(() => {
    const i = this.detail.record();
    const live = [ApprovalStatus.Draft, ApprovalStatus.Pending, ApprovalStatus.Approved];
    return (
      !!i?.patient?.insurer &&
      this.payable() &&
      !(i.claims ?? []).some((c) => live.includes(c.status))
    );
  });
  protected readonly facts = computed<Fact[]>(() => {
    const i = this.detail.record();
    if (!i) return [];
    return [
      {
        label: INVOICE_DETAIL_TEXT.patient,
        value: i.patient ? `${i.patient.fullName} · ${i.patient.code}` : null,
      },
      { label: INVOICE_DETAIL_TEXT.insurer, value: i.patient?.insurer?.name },
      {
        label: INVOICE_DETAIL_TEXT.issued,
        value: i.issueDate ? `${this.date(i.issueDate)} by ${i.issuedBy?.fullName ?? '—'}` : null,
      },
      { label: INVOICE_DETAIL_TEXT.due, value: i.dueDate ? this.date(i.dueDate) : null },
      { label: INVOICE_DETAIL_TEXT.draftCode, value: i.code, mono: true },
      { label: INVOICE_DETAIL_TEXT.cancelled, value: i.cancellationReason },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  private date(iso: string): string {
    return formatDate(iso, DATE_FORMAT, 'en-US');
  }

  ngOnInit(): void {
    void this.detail.load(this.id());
  }

  protected sourceLink(item: InvoiceItem): string[] | null {
    const base = item.source ? SOURCE_ROUTES[item.source.type] : undefined;
    return base && item.source ? [base, item.source.id] : null;
  }

  protected voidable(p: Payment): boolean {
    return (
      p.status === PaymentStatus.Completed &&
      (toMinor(p.refundedAmount.amount) ?? 0n) === 0n &&
      clinicIsoDate(new Date(p.paidAt)) === clinicIsoDate()
    );
  }

  protected refundable(p: Payment): boolean {
    return (
      p.status === PaymentStatus.Completed &&
      p.method !== PaymentMethod.Insurance &&
      (toMinor(p.refundable.amount) ?? 0n) > 0n
    );
  }

  protected pending(r: Refund): boolean {
    return r.status === ApprovalStatus.Pending;
  }

  protected approvedUnpaid(r: Refund): boolean {
    return r.status === ApprovalStatus.Approved && !r.isProcessed;
  }

  protected readonly edit = async (): Promise<void> => {
    const i = this.detail.record();
    if (i && (await this.actions.editInvoice({ invoice: i }))) await this.reload();
  };

  protected readonly reminderText = REMINDER_TEXT;
  /** "2 reminders sent · 03 Nov 2026" for the button's tooltip. */
  protected readonly remindedNote = computed(() => {
    const i = this.detail.record();
    if (!i?.remindersSent) return null;
    const last = i.lastRemindedAt
      ? ' · ' + formatDate(i.lastRemindedAt, dateTimeFormat(), 'en-GB')
      : '';
    return REMINDER_TEXT.count(i.remindersSent) + last;
  });

  protected readonly remind = async (): Promise<void> => {
    const i = this.detail.record();
    if (i && (await this.actions.remind(i))) await this.reload();
  };

  protected readonly issue = async (): Promise<void> => {
    const i = this.detail.record();
    if (i && (await this.actions.issue(i))) await this.reload();
  };

  protected readonly pay = async (): Promise<void> => {
    const i = this.detail.record();
    if (i && (await this.actions.takePayment(i))) await this.reload();
  };

  protected readonly claim = async (): Promise<void> => {
    const i = this.detail.record();
    if (i) await this.actions.createClaim(i);
  };

  protected readonly cancel = async (): Promise<void> => {
    const i = this.detail.record();
    if (i && (await this.actions.cancelInvoice(i))) await this.reload();
  };

  protected readonly voidPayment = async (p: Payment): Promise<void> => {
    if (await this.actions.voidPayment(p)) await this.reload();
  };

  protected readonly refund = async (p: Payment): Promise<void> => {
    const i = this.detail.record();
    if (i && (await this.actions.requestRefund({ payment: p, invoice: i }))) await this.reload();
  };

  protected readonly approve = async (r: Refund): Promise<void> => {
    if (await this.actions.approveRefund(r)) await this.reload();
  };

  protected readonly reject = async (r: Refund): Promise<void> => {
    if (await this.actions.rejectRefund(r)) await this.reload();
  };

  protected readonly payOut = async (r: Refund): Promise<void> => {
    if (await this.actions.processRefund(r)) await this.reload();
  };

  private reload(): Promise<void> {
    return this.detail.load(this.id());
  }
}
