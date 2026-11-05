import { DocumentType } from '@enums/documents/document-type.enum';
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
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@constants/app.constants';
import { PaymentStatus } from '@enums/billing/payment-status.enum';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { toMinor } from '@utilities/money';
import { INVOICE_PRINT_TEXT } from '@constants/billing/invoice-print.constants';

/** `/print/invoice/:id` — the issued invoice (a tax invoice when it carries VAT) with payments and balance. */
@Component({
  selector: 'app-invoice-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, MoneyPipe, DatePipe],
  templateUrl: './invoice-print.page.html',
})
export class InvoicePrintPage implements OnInit {
  protected readonly text = INVOICE_PRINT_TEXT;

  protected readonly documentType = DocumentType;
  readonly id = input.required<string>();

  private readonly api = inject(InvoiceApi);
  protected readonly invoice = signal<Invoice | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly title = computed(() =>
    (toMinor(this.invoice()?.taxTotal.amount) ?? 0n) > 0n
      ? INVOICE_PRINT_TEXT.taxInvoice
      : INVOICE_PRINT_TEXT.invoice,
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
