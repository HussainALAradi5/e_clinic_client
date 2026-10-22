import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingActions } from '../../services/billing-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { InvoiceStatus, PAYABLE_INVOICE_STATUSES } from '@shared/enums/billing/invoice-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Invoice } from '@shared/interfaces/billing/invoice.interface';
import { PatientSummary } from '@shared/interfaces/common/summary.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { InvoiceApi } from '@shared/services/billing/invoice-api.service';
import { defaultQuery } from '@shared/utils/list-query';
import { fromMinor, toMinor } from '@shared/utils/money';

/** The patient's invoices on the patient file: what they still owe, the open draft, and paying from here. */
@Component({
  selector: 'app-patient-billing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton, StatusChip, MatIconModule, RouterLink, MoneyPipe, DatePipe],
  host: { class: 'block' },
  templateUrl: './patient-billing.component.html',
})
export class PatientBilling implements OnInit {
  readonly patient = input.required<PatientSummary>();

  private readonly api = inject(InvoiceApi);
  private readonly actions = inject(BillingActions);
  protected readonly invoices = signal<Invoice[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;

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
}
