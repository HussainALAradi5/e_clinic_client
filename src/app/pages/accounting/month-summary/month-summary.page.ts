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
import { SummaryTile } from '@components/accounting/summary-tile/summary-tile.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { ProgressBar } from '@components/common/progress-bar/progress-bar.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { ENDPOINTS } from '@config/endpoints';
import { MONTH_SUMMARY_TEXT } from '@constants/accounting/month-summary.constants';
import { MonthSummary } from '@interfaces/accounting/month-summary.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { ApiClient } from '@services/api/api-client.service';
import { figureValue } from '@utilities/accounting/month-change';

/**
 * `/accounting/month-summary` — the owner's month: money, what is owed and held, activity, how it was collected
 * and the top doctors, each figure next to the month before. Previous / next month.
 */
@Component({
  selector: 'app-month-summary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    SummaryTile,
    ProgressBar,
    Skeleton,
    MoneyPipe,
    EnumLabelPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './month-summary.page.html',
})
export class MonthSummaryPage {
  private readonly api = inject(ApiClient);
  protected readonly text = MONTH_SUMMARY_TEXT;
  /** First day of the month shown (last month by default). */
  protected readonly start = signal(this.firstOfMonth(-1));
  protected readonly summary = signal<MonthSummary | null>(null);

  /** Each method's share of what was collected, for the bars. */
  protected readonly methods = computed(() => {
    const s = this.summary();
    if (!s) return [];
    const total = figureValue(s.current.collected) || 1;
    return s.current.collectedByMethod.map((m) => ({
      ...m,
      share: (figureValue(m.total) / total) * 100,
    }));
  });
  protected readonly topShare = computed(() => {
    const top = this.summary()?.topDoctors ?? [];
    const best = figureValue(top[0]?.revenue ?? 0) || 1;
    return top.map((d) => ({ ...d, share: (figureValue(d.revenue) / best) * 100 }));
  });

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

  private async load(start: Date): Promise<void> {
    this.summary.set(null);
    const params = { year: start.getFullYear(), month: start.getMonth() + 1 };
    this.summary.set(
      await firstValueFrom(
        this.api.get<MonthSummary>(ENDPOINTS.accounting.monthSummary, { params }),
      ).catch(() => null),
    );
  }

  private firstOfMonth(offset: number): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + offset, 1);
  }
}
