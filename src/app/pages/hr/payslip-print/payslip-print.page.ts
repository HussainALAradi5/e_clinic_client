import { DatePipe, DecimalPipe } from '@angular/common';
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
import { DATE_FORMAT } from '@constants/app.constants';
import { PayrollStatus } from '@enums/hr/payroll-status.enum';
import { Payslip } from '@interfaces/hr/payslip.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { PayrollApi } from '@services/hr/payroll-api.service';
import { PAYSLIP_PRINT_TEXT } from '@constants/hr/payslip-print.constants';

/** `/print/payslip/:id` — the employee's payslip: earnings, deductions, net and the days behind them (A4). */
@Component({
  selector: 'app-payslip-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, MoneyPipe, QtyPipe, DatePipe, DecimalPipe],
  templateUrl: './payslip-print.page.html',
})
export class PayslipPrintPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(PayrollApi);
  protected readonly slip = signal<Payslip | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly earnings = computed(() =>
    (this.slip()?.items ?? []).filter((i) => i.isEarning),
  );
  protected readonly deductions = computed(() =>
    (this.slip()?.items ?? []).filter((i) => !i.isEarning),
  );
  protected readonly title = computed(() => {
    const s = this.slip();
    const month = s?.run
      ? new Date(`${s.run.periodStart}T00:00:00`).toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric',
        })
      : '';
    const draft = s?.run && ![PayrollStatus.Approved, PayrollStatus.Paid].includes(s.run.status);
    return PAYSLIP_PRINT_TEXT.payslip(month, draft ? ' (DRAFT)' : '');
  });

  async ngOnInit(): Promise<void> {
    try {
      this.slip.set(await firstValueFrom(this.api.payslip(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }
}
