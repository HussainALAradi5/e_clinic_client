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
  template: `
    <ui-page-header [title]="text.title" [subtitle]="text.subtitle" />
    <div class="mb-4 flex items-center gap-2">
      <button matIconButton aria-label="Previous month" (click)="shift(-1)">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <span class="min-w-40 text-center font-semibold">{{ start() | date: 'MMMM y' }}</span>
      <button matIconButton aria-label="Next month" (click)="shift(1)">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
    @if (rows(); as list) {
      <div class="overflow-x-auto rounded-2xl border border-outline-variant">
        <table class="w-full text-sm">
          <thead class="bg-surface-container text-left">
            <tr>
              <th class="px-4 py-2">{{ text.doctor }}</th>
              <th class="px-4 py-2">{{ text.terms }}</th>
              <th class="px-4 py-2 text-right">{{ text.revenue }}</th>
              <th class="px-4 py-2 text-right">{{ text.visits }}</th>
              <th class="px-4 py-2 text-right">{{ text.commission }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (r of list; track r.doctor.id) {
              <tr class="motion-rise border-t border-outline-variant/60">
                <td class="px-4 py-2 font-medium">{{ r.doctor.fullName }}</td>
                <td class="px-4 py-2">{{ text.termsLabel(r.commissionType, r.rate) }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ r.revenue | money }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ r.visits }}</td>
                <td class="px-4 py-2 text-right font-semibold tabular-nums">
                  {{ r.commission | money }}
                </td>
                <td class="px-2 py-1 text-right">
                  <ui-button
                    icon="tune"
                    [variant]="variants.Text"
                    access="employees.manage_salary"
                    [action]="edit.bind(this, r)"
                    >{{ text.edit }}</ui-button
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td class="px-4 py-6 text-center text-on-surface-variant" colspan="6">
                  {{ text.none }}
                </td>
              </tr>
            }
          </tbody>
          @if (list.length > 1) {
            <tfoot class="border-t border-outline-variant font-semibold">
              <tr>
                <td class="px-4 py-2" colspan="4">{{ text.total }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ total() | money }}</td>
                <td></td>
              </tr>
            </tfoot>
          }
        </table>
      </div>
    } @else {
      <ui-skeleton [rows]="4" />
    }
  `,
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
