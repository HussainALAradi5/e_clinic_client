import { dateTimeFormat } from '@utilities/clock-format';
import { DocumentType } from '@enums/documents/document-type.enum';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { PaymentStatus } from '@enums/billing/payment-status.enum';
import { Payment } from '@interfaces/billing/payment.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { PaymentApi } from '@services/billing/payment-api.service';
import { RECEIPT_PRINT_TEXT } from '@constants/billing/receipt-print.constants';

/** `/print/receipt/:id` — payment receipt for an 80 mm receipt printer. */
@Component({
  selector: 'app-receipt-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, MoneyPipe, DatePipe],
  templateUrl: './receipt-print.page.html',
})
export class ReceiptPrintPage implements OnInit {
  protected readonly text = RECEIPT_PRINT_TEXT;

  protected readonly documentType = DocumentType;
  readonly id = input.required<string>();

  private readonly api = inject(PaymentApi);
  protected readonly payment = signal<Payment | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateTimeFormat = dateTimeFormat;
  protected readonly voided = PaymentStatus.Voided;

  async ngOnInit(): Promise<void> {
    try {
      this.payment.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }
}
