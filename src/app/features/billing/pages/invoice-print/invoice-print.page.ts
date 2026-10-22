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
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PrintSheet } from '@shared/components/print-sheet/print-sheet.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { PaymentStatus } from '@shared/enums/billing/payment-status.enum';
import { Invoice } from '@shared/interfaces/billing/invoice.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { InvoiceApi } from '@shared/services/billing/invoice-api.service';
import { toMinor } from '@shared/utils/money';

/** `/print/invoice/:id` — the issued invoice (a tax invoice when it carries VAT) with payments and balance. */
@Component({
  selector: 'app-invoice-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, MoneyPipe, DatePipe],
  templateUrl: './invoice-print.page.html',
})
export class InvoicePrintPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(InvoiceApi);
  protected readonly invoice = signal<Invoice | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly title = computed(() =>
    (toMinor(this.invoice()?.taxTotal.amount) ?? 0n) > 0n ? 'Tax invoice' : 'Invoice',
  );
  protected readonly payments = computed(() =>
    (this.invoice()?.payments ?? []).filter((p) => p.status === PaymentStatus.Completed),
  );

  async ngOnInit(): Promise<void> {
    try {
      this.invoice.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }
}
