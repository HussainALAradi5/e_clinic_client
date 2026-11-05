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
import { firstValueFrom } from 'rxjs';
import { CommissionDialog } from '@components/hr/commission-dialog/commission-dialog.component';
import { AppButton } from '@components/common/app-button/app-button.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { EARNINGS_TEXT } from '@constants/hr/doctor-earnings.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { DoctorEarning } from '@interfaces/hr/doctor-earning.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { DoctorEarningApi } from '@services/hr/doctor-earning-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { fromMinor, money, toMinor } from '@utilities/money';

/**
 * `/hr/doctor-earnings` — each doctor's revenue, completed visits and commission for a month (previous / next),
 * with their terms editable by salary managers. The amounts come from the ledger, as on the payslip.
 */
@Component({
  selector: 'app-doctor-earnings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, AppButton, Skeleton, MoneyPipe, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './doctor-earnings.page.html',
})
export class DoctorEarningsPage {
  private readonly api = inject(DoctorEarningApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  protected readonly text = EARNINGS_TEXT;
  protected readonly variants = ButtonVariant;

  /** First day of the month shown (last month by default: this one is still running). */
  protected readonly start = signal(this.firstOfMonth(-1));
  protected readonly rows = signal<DoctorEarning[] | null>(null);
  protected readonly total = computed(() =>
    money(
      fromMinor(
        (this.rows() ?? []).reduce((sum, r) => sum + (toMinor(r.commission.amount) ?? 0n), 0n),
      ),
    ),
  );

  constructor() {
    effect(() => {
      const start = this.start();
      untracked(() => void this.load(start));
    });
  }

  protected shift(months: number): void {
    const d = this.start();
    this.start.set(new Date(d.getFullYear(), d.getMonth() + months, 1));
  }

  protected readonly edit = async (row: DoctorEarning): Promise<void> => {
    const saved = await this.dialogs.open<CommissionDialog, DoctorEarning, boolean>(
      CommissionDialog,
      row,
    );
    if (saved) {
      this.notify.success(EARNINGS_TEXT.saved);
      await this.load(this.start());
    }
  };

  private async load(start: Date): Promise<void> {
    this.rows.set(null);
    this.rows.set(
      await firstValueFrom(this.api.month(start.getFullYear(), start.getMonth() + 1)).catch(
        () => [],
      ),
    );
  }

  private firstOfMonth(offset: number): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + offset, 1);
  }
}
