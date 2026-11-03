import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
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
import { EnumFilter } from '@components/common/enum-filter/enum-filter.component';
import { DateRangeFilter } from '@components/common/date-range-filter/date-range-filter.component';
import { DateRangeValue } from '@interfaces/list/date-range-filter.interface';
import { dateRangeQuery } from '@utilities/date-range-query';

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
    EnumFilter,
    DateRangeFilter,
  ],
  templateUrl: './invoices.page.html',
})
export class MyInvoicesPage {
  /** From / to on the issued (on the server). */
  protected readonly dateFields = [{ value: 'issue_date', label: 'Issued' }];
  protected readonly dates = signal<DateRangeValue>({});

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

  /** Quick filters (on the server): how it stands with its payments, how it was paid. */
  protected readonly paymentState = signal<string | null>(null);
  protected readonly method = signal<string | null>(null);
  protected readonly filtered = computed(
    () =>
      !!this.paymentState() ||
      !!this.method() ||
      !!this.dates().from ||
      !!this.dates().to ||
      !!this.dates().preset,
  );

  constructor() {
    effect(() => {
      const state = this.paymentState();
      const method = this.method();
      const dates = this.dates();
      untracked(() => {
        this.invoices.set(null);
        firstValueFrom(
          this.api.listBy(
            { perPage: 50, sort: ['-issueDate'], ...dateRangeQuery('issue_date', dates) },
            state,
            method,
          ),
        )
          .then((page) => this.invoices.set(page.data))
          .catch(() => this.invoices.set([]));
      });
    });
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
