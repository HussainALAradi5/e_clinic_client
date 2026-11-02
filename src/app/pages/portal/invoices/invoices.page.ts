import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { CLINIC_TIME_ZONE, DATE_FORMAT, DATE_TIME_FORMAT } from '@constants/app.constants';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { formatMoney, fromMinor, money, toMinor } from '@utilities/money';

/**
 * `/portal/invoices` — issued invoices (drafts stay at the desk) with what is left to pay; each opens to its lines
 * and payments, with the printable invoice and receipts.
 */
@Component({
  selector: 'app-my-invoices-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    EmptyState,
    Skeleton,
    StatusChip,
    EnumLabelPipe,
    MoneyPipe,
  ],
  templateUrl: './invoices.page.html',
})
export class MyInvoicesPage {
  private readonly api = inject(InvoiceApi);

  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly zone = CLINIC_TIME_ZONE;
  protected readonly invoices = signal<Invoice[] | null>(null);
  protected readonly open = signal<string | null>(null);
  protected readonly details = signal<Record<string, Invoice>>({});

  protected readonly due = computed(() => {
    const minor = (this.invoices() ?? []).reduce(
      (sum, i) => sum + (toMinor(i.balanceDue.amount) ?? 0n),
      0n,
    );
    return minor > 0n ? formatMoney(money(fromMinor(minor))) : null;
  });

  constructor() {
    firstValueFrom(this.api.list({ perPage: 50, sort: ['-issueDate'] }))
      .then((page) => this.invoices.set(page.data))
      .catch(() => this.invoices.set([]));
  }

  protected owing(invoice: Invoice): boolean {
    return (toMinor(invoice.balanceDue.amount) ?? 0n) > 0n;
  }

  protected async toggle(invoice: Invoice): Promise<void> {
    this.open.update((id) => (id === invoice.id ? null : invoice.id));
    if (this.open() === invoice.id && !this.details()[invoice.id]) {
      const full = await firstValueFrom(this.api.get(invoice.id)).catch(() => invoice);
      this.details.update((all) => ({ ...all, [invoice.id]: full }));
    }
  }
}
