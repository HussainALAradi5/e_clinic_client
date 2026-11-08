import { dateTimeFormat } from '@utilities/clock-format';
import { DocumentType } from '@enums/documents/document-type.enum';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { CashSession } from '@interfaces/finance/cash-session.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { CashSessionApi } from '@services/finance/cash-session-api.service';

/** `/print/z-report/:id` — shift report of a cash drawer (X-report while open, Z-report once closed). */
import { WALLET_TEXT } from '@constants/billing/wallet.constants';
import { Z_REPORT_PRINT_TEXT } from '@constants/billing/z-report-print.constants';
@Component({
  selector: 'app-z-report-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, MoneyPipe, DatePipe],
  templateUrl: './z-report-print.page.html',
})
export class ZReportPrintPage implements OnInit {
  protected readonly text = Z_REPORT_PRINT_TEXT;

  protected readonly walletText = WALLET_TEXT;
  protected readonly documentType = DocumentType;
  readonly id = input.required<string>();

  private readonly api = inject(CashSessionApi);
  protected readonly session = signal<CashSession | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateTimeFormat = dateTimeFormat;

  async ngOnInit(): Promise<void> {
    try {
      this.session.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }
}
