import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingActions } from '@services/billing/billing-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { InvoiceStatus, PAYABLE_INVOICE_STATUSES } from '@enums/billing/invoice-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { defaultQuery } from '@utilities/list-query';
import { fromMinor, toMinor } from '@utilities/money';
import { PatientWallet } from '@components/billing/patient-wallet/patient-wallet.component';
import { WALLET_TEXT } from '@constants/billing/wallet.constants';
import { HasAccessDirective } from '@directives/has-access.directive';

/** The patient's invoices on the patient file: what they still owe, the open draft, and paying from here. */
import { InvoicePaidBar } from '@components/billing/invoice-paid-bar/invoice-paid-bar.component';
import { PatientPackages } from '@components/billing/patient-packages/patient-packages.component';
import { PATIENT_BILLING_TEXT } from '@constants/billing/patient-billing.constants';
@Component({
  selector: 'app-patient-billing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InvoicePaidBar,
    AppButton,
    StatusChip,
    MatIconModule,
    RouterLink,
    MoneyPipe,
    DatePipe,
    PatientWallet,
    HasAccessDirective,
    PatientPackages,
  ],
  host: { class: 'block' },
  templateUrl: './patient-billing.component.html',
})
export class PatientBilling implements OnInit {
  protected readonly labels = PATIENT_BILLING_TEXT;

  readonly patient = input.required<PatientSummary>();

  private readonly api = inject(InvoiceApi);
  private readonly actions = inject(BillingActions);
  protected readonly invoices = signal<Invoice[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly text = WALLET_TEXT;
  private readonly walletCard = viewChild(PatientWallet);
  /** Balance held for the patient, when the card is shown and it holds money. */
  protected readonly walletMoney = computed(() => {
    const balance = this.walletCard()?.wallet()?.balance;
    return balance && (toMinor(balance.amount) ?? 0n) > 0n ? balance : null;
  });

  protected readonly owed = computed(() =>
    fromMinor(
      (this.invoices() ?? [])
        .filter((i) => PAYABLE_INVOICE_STATUSES.includes(i.status))
        .reduce((sum, i) => sum + (toMinor(i.balanceDue.amount) ?? 0n), 0n),
    ),
  );
  protected readonly draft = computed(
    () => this.invoices()?.find((i) => i.status === InvoiceStatus.Draft) ?? null,
  );

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    const page = await firstValueFrom(
      this.api.list(
        defaultQuery({
          perPage: 50,
          sort: ['-createdAt'],
          filter: { and: [{ patientId: { eq: this.patient().id } }] },
        }),
      ),
    ).catch(() => null);
    this.invoices.set(page?.data ?? []);
  }

  protected payable(invoice: Invoice): boolean {
    return PAYABLE_INVOICE_STATUSES.includes(invoice.status);
  }

  protected readonly addLines = async (): Promise<void> => {
    const draft = this.draft();
    const full = draft ? await firstValueFrom(this.api.get(draft.id)) : null;
    if (await this.actions.editInvoice({ invoice: full, patient: this.patient() }))
      await this.load();
  };

  protected readonly pay = async (invoice: Invoice): Promise<void> => {
    const full = await firstValueFrom(this.api.get(invoice.id));
    if (await this.actions.takePayment(full)) await this.load();
  };

  protected readonly payFromBalance = async (invoice: Invoice): Promise<void> => {
    const balance = this.walletMoney();
    if (!balance || !(await this.actions.payFromBalance(invoice, balance))) return;
    await Promise.all([this.load(), this.walletCard()?.load()]);
  };
}
