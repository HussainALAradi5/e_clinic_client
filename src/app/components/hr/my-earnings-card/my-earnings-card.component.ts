import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, of } from 'rxjs';
import { EARNINGS_TEXT } from '@constants/hr/doctor-earnings.constants';
import { CommissionType } from '@enums/hr/commission-type.enum';
import { MoneyPipe } from '@pipes/money.pipe';
import { DoctorEarningApi } from '@services/hr/doctor-earning-api.service';

/**
 * A doctor's own commission so far this month (My HR). Shows only for doctors on commission; the server returns
 * just their own row.
 */
@Component({
  selector: 'app-my-earnings-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MoneyPipe],
  template: `
    @if (mine(); as r) {
      <section class="motion-rise rounded-2xl border border-outline-variant bg-surface p-4">
        <p class="m-0 flex items-center gap-2 text-sm text-on-surface-variant">
          <mat-icon class="text-primary">trending_up</mat-icon>{{ text.myTitle }}
        </p>
        <p class="m-0 mt-1 text-2xl font-semibold tabular-nums">{{ r.commission | money }}</p>
        <p class="m-0 text-xs text-on-surface-variant">
          {{ text.termsLabel(r.commissionType, r.rate) }} · {{ r.visits }} {{ text.visits }} ·
          {{ r.revenue | money }}
        </p>
        <p class="m-0 mt-1 text-xs text-on-surface-variant">{{ text.myHint }}</p>
      </section>
    }
  `,
})
export class MyEarningsCard {
  protected readonly text = EARNINGS_TEXT;
  private readonly now = new Date();
  protected readonly mine = toSignal(
    inject(DoctorEarningApi)
      .month(this.now.getFullYear(), this.now.getMonth() + 1)
      .pipe(
        map((rows) => rows.find((r) => r.commissionType !== CommissionType.None) ?? null),
        catchError(() => of(null)),
      ),
    { initialValue: null },
  );
}
