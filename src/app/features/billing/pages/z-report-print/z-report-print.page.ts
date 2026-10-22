import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PrintSheet } from '@shared/components/print-sheet/print-sheet.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { CashSession } from '@shared/interfaces/finance/cash-session.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { CashSessionApi } from '@shared/services/finance/cash-session-api.service';

/** `/print/z-report/:id` — shift report of a cash drawer (X-report while open, Z-report once closed). */
@Component({
  selector: 'app-z-report-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, MoneyPipe, DatePipe],
  templateUrl: './z-report-print.page.html',
})
export class ZReportPrintPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(CashSessionApi);
  protected readonly session = signal<CashSession | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;

  async ngOnInit(): Promise<void> {
    try {
      this.session.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }
}
