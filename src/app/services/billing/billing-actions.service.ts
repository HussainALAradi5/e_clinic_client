import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClaimDecisionDialog } from '@components/billing/claim-decision-dialog/claim-decision-dialog.component';
import { CloseDrawerDialog } from '@components/billing/close-drawer-dialog/close-drawer-dialog.component';
import { DepositDialog } from '@components/billing/deposit-dialog/deposit-dialog.component';
import { InvoiceEditorDialog } from '@components/billing/invoice-editor-dialog/invoice-editor-dialog.component';
import { OpenDrawerDialog } from '@components/billing/open-drawer-dialog/open-drawer-dialog.component';
import { PaymentDialog } from '@components/billing/payment-dialog/payment-dialog.component';
import { RefundDialog } from '@components/billing/refund-dialog/refund-dialog.component';
import { RemittanceDialog } from '@components/billing/remittance-dialog/remittance-dialog.component';
import { ClaimDecisionDialogData } from '@interfaces/billing/claim-decision-dialog-data.interface';
import { CloseDrawerDialogData } from '@interfaces/billing/close-drawer-dialog-data.interface';
import { DepositDialogData } from '@interfaces/billing/deposit-dialog-data.interface';
import { InvoiceEditorDialogData } from '@interfaces/billing/invoice-editor-dialog-data.interface';
import { PaymentDialogData } from '@interfaces/billing/payment-dialog-data.interface';
import { RefundDialogData } from '@interfaces/billing/refund-dialog-data.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { ErrorCode } from '@enums/api/error-code.enum';
import { CashSessionStatus } from '@enums/finance/cash-session-status.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { InsuranceClaim } from '@interfaces/billing/insurance-claim.interface';
import { ChargePayload } from '@interfaces/billing/charge-payload.interface';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { Payment } from '@interfaces/billing/payment.interface';
import { Refund } from '@interfaces/billing/refund.interface';
import { CashSession } from '@interfaces/finance/cash-session.interface';
import { InsuranceClaimApi } from '@services/billing/insurance-claim-api.service';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { PaymentApi } from '@services/billing/payment-api.service';
import { RefundApi } from '@services/billing/refund-api.service';
import { CashSessionApi } from '@services/finance/cash-session-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { isApiError } from '@utilities/guards';
import { formatMoney } from '@utilities/money';

/**
 * Billing and cash-drawer steps with their confirmations and messages — one place for the invoice, cashier desk,
 * patient file and visit pages. Each returns the changed record, or undefined when the user backed out.
 */
@Injectable({ providedIn: 'root' })
export class BillingActions {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly invoices = inject(InvoiceApi);
  private readonly payments = inject(PaymentApi);
  private readonly refunds = inject(RefundApi);
  private readonly drawers = inject(CashSessionApi);
  private readonly claims = inject(InsuranceClaimApi);

  editInvoice(data: InvoiceEditorDialogData): Promise<Invoice | undefined> {
    return this.dialogs.openAction<InvoiceEditorDialog, InvoiceEditorDialogData, Invoice>(
      InvoiceEditorDialog,
      data,
      (i) => `Draft ${i.code} saved — ${formatMoney(i.total)}.`,
      '960px',
    );
  }

  async issue(invoice: Invoice): Promise<Invoice | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Issue ${formatMoney(invoice.total)} to ${invoice.patient?.fullName ?? 'the patient'}?`,
      message:
        'The invoice gets its number and is posted to the accounts. After that it can no longer be edited — only cancelled (without payments) or refunded.',
      confirmLabel: 'Issue invoice',
    });
    if (!ok) return undefined;
    const issued = await firstValueFrom(this.invoices.issue(invoice.id, newIdempotencyKey()));
    this.notify.success(`Invoice ${issued.invoiceNumber} issued.`);
    return issued;
  }

  async cancelInvoice(invoice: Invoice): Promise<Invoice | undefined> {
    const reason = await this.dialogs.reason({
      title: `Cancel ${invoice.invoiceNumber ?? invoice.code}?`,
      message: invoice.invoiceNumber
        ? 'Its revenue is reversed; the number stays used. Visits on it can be billed again.'
        : 'The draft and its lines are dropped. Visits on it can be billed again.',
      confirmLabel: 'Cancel invoice',
      danger: true,
    });
    if (!reason) return undefined;
    const cancelled = await firstValueFrom(this.invoices.cancel(invoice.id, reason));
    this.notify.success('Invoice cancelled.');
    return cancelled;
  }

  /** Bill a visit or order by hand; when it is already billed, open that invoice instead. */
  async charge(payload: ChargePayload): Promise<Invoice | undefined> {
    try {
      const invoice = await firstValueFrom(this.invoices.charge(payload));
      this.notify.success(`Added to draft ${invoice.code} — ${formatMoney(invoice.total)}.`);
      await this.router.navigate(['/billing/invoices', invoice.id]);
      return invoice;
    } catch (error) {
      if (isApiError(error) && error.code === ErrorCode.AlreadyCharged) {
        this.notify.info('Already on an invoice.');
        return undefined;
      }
      throw error;
    }
  }

  takePayment(invoice: Invoice): Promise<Payment[] | undefined> {
    return this.dialogs.openAction<PaymentDialog, PaymentDialogData, Payment[]>(
      PaymentDialog,
      { invoice },
      (paid) =>
        paid.length === 1
          ? `Payment ${paid[0].code} taken — ${formatMoney(paid[0].amount)}.`
          : `${paid.length} payments taken.`,
      '600px',
    );
  }

  async voidPayment(payment: Payment): Promise<Payment | undefined> {
    const reason = await this.dialogs.reason({
      title: `Void ${payment.code}?`,
      message: `${formatMoney(payment.amount)} goes back onto the invoice balance. Only today's payments without refunds can be voided.`,
      confirmLabel: 'Void payment',
      danger: true,
    });
    if (!reason) return undefined;
    const voided = await firstValueFrom(this.payments.void(payment.id, reason));
    this.notify.success(`Payment ${voided.code} voided.`);
    return voided;
  }

  requestRefund(data: RefundDialogData): Promise<Refund | undefined> {
    return this.dialogs.openAction<RefundDialog, RefundDialogData, Refund>(
      RefundDialog,
      data,
      (r) => `Refund ${r.code} sent for approval.`,
    );
  }

  async approveRefund(refund: Refund): Promise<Refund | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Approve ${formatMoney(refund.amount)} to ${refund.patient?.fullName ?? 'the patient'}?`,
      message: refund.reason,
      confirmLabel: 'Approve',
    });
    if (!ok) return undefined;
    const approved = await firstValueFrom(this.refunds.approve(refund.id));
    this.notify.success(`Refund ${approved.code} approved — the cashier can pay it out.`);
    return approved;
  }

  async rejectRefund(refund: Refund): Promise<Refund | undefined> {
    const reason = await this.dialogs.reason({
      title: `Reject refund ${refund.code}?`,
      confirmLabel: 'Reject',
      danger: true,
    });
    if (!reason) return undefined;
    const rejected = await firstValueFrom(this.refunds.reject(refund.id, reason));
    this.notify.success('Refund rejected.');
    return rejected;
  }

  async processRefund(refund: Refund): Promise<Refund | undefined> {
    const cash = refund.method === PaymentMethod.Cash;
    const answer = await this.dialogs.ask({
      title: `Pay out ${formatMoney(refund.amount)}?`,
      message: cash
        ? 'Hand the cash to the patient; it leaves your open drawer.'
        : 'Send the money back the same way, then note the bank or terminal reference.',
      confirmLabel: 'Paid out',
      reason: !cash,
      reasonLabel: 'Reference',
    });
    if (!answer.confirmed) return undefined;
    const processed = await firstValueFrom(
      this.refunds.process(refund.id, answer.reason ?? null, newIdempotencyKey()),
    );
    this.notify.success(`Refund ${processed.code} paid out.`);
    return processed;
  }

  openDrawer(): Promise<CashSession | undefined> {
    return this.dialogs.openAction<OpenDrawerDialog, null, CashSession>(
      OpenDrawerDialog,
      null,
      (s) => `Drawer ${s.code} open with ${formatMoney(s.openingFloat)}.`,
    );
  }

  closeDrawer(session: CashSession): Promise<CashSession | undefined> {
    return this.dialogs.openAction<CloseDrawerDialog, CloseDrawerDialogData, CashSession>(
      CloseDrawerDialog,
      { session },
      (s) =>
        s.status === CashSessionStatus.Closing
          ? `Drawer counted — the difference of ${formatMoney(s.difference)} waits for a supervisor.`
          : `Drawer ${s.code} closed.`,
      '640px',
    );
  }

  async approveDifference(session: CashSession): Promise<CashSession | undefined> {
    const notes = await this.dialogs.reason({
      title: `Accept a difference of ${formatMoney(session.difference)}?`,
      message: `${session.cashier?.fullName ?? 'The cashier'} counted ${formatMoney(session.countedClosing)}; ${formatMoney(session.expectedClosing)} was expected. It is posted to cash over / short.`,
      confirmLabel: 'Accept and close',
      reasonLabel: 'Notes',
    });
    if (!notes) return undefined;
    const closed = await firstValueFrom(this.drawers.approveDifference(session.id, notes));
    this.notify.success(`Drawer ${closed.code} closed.`);
    return closed;
  }

  deposit(session: CashSession): Promise<CashSession | undefined> {
    return this.dialogs.openAction<DepositDialog, DepositDialogData, CashSession>(
      DepositDialog,
      { session },
      (s) => `Deposit of ${formatMoney(s.depositAmount)} recorded.`,
    );
  }

  // Insurance claims

  async createClaim(invoice: Invoice): Promise<InsuranceClaim | undefined> {
    const preAuth = await this.dialogs.ask({
      title: `Claim the insurer's share of ${invoice.invoiceNumber}?`,
      message: `${invoice.patient?.insurer?.name ?? 'The insurer'} is asked for its share of the insurable lines. Every visit needs a signed note with a primary diagnosis.`,
      confirmLabel: 'Prepare claim',
      reason: true,
      reasonLabel: 'Pre-authorisation number (if any)',
    });
    if (!preAuth.confirmed) return undefined;
    const claim = await firstValueFrom(
      this.claims.create(invoice.id, preAuth.reason?.trim() || null, newIdempotencyKey()),
    );
    this.notify.success(`Claim ${claim.code} prepared — ${formatMoney(claim.claimedAmount)}.`);
    await this.router.navigate(['/billing/insurance-claims', claim.id]);
    return claim;
  }

  async submitClaim(claim: InsuranceClaim): Promise<InsuranceClaim | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Mark ${claim.code} as sent to ${claim.insurer?.name ?? 'the insurer'}?`,
      message: 'Print the claim form and send it with the invoice; then wait for the decision.',
      confirmLabel: 'Sent',
    });
    if (!ok) return undefined;
    const sent = await firstValueFrom(this.claims.submit(claim.id));
    this.notify.success(`Claim ${sent.code} sent.`);
    return sent;
  }

  decideClaim(claim: InsuranceClaim): Promise<InsuranceClaim | undefined> {
    return this.dialogs.openAction<ClaimDecisionDialog, ClaimDecisionDialogData, InsuranceClaim>(
      ClaimDecisionDialog,
      { claim },
      (c) =>
        c.status === ApprovalStatus.Approved
          ? `Approved ${formatMoney(c.approvedAmount)} — recorded on the invoice.`
          : 'Claim rejected — the patient keeps the balance.',
    );
  }

  async cancelClaim(claim: InsuranceClaim): Promise<InsuranceClaim | undefined> {
    const reason = await this.dialogs.reason({
      title: `Cancel claim ${claim.code}?`,
      confirmLabel: 'Cancel claim',
      danger: true,
    });
    if (!reason) return undefined;
    const cancelled = await firstValueFrom(this.claims.cancel(claim.id, reason));
    this.notify.success('Claim cancelled.');
    return cancelled;
  }

  recordRemittance(): Promise<InsuranceClaim[] | undefined> {
    return this.dialogs.openAction<RemittanceDialog, null, InsuranceClaim[]>(
      RemittanceDialog,
      null,
      (claims) => `Remittance recorded for ${claims.length} claim(s).`,
      '640px',
    );
  }
}
