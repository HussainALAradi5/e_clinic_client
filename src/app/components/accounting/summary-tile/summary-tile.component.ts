import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MONTH_SUMMARY_TEXT } from '@constants/accounting/month-summary.constants';
import { Money } from '@interfaces/common/money.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { monthChange } from '@utilities/accounting/month-change';

/**
 * One figure of the month with its change from the month before: an arrow and a colour that say whether the change
 * is good (green) or not (red) — `lowerIsBetter` for things like no-shows or what is owed.
 */
@Component({
  selector: 'app-summary-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MoneyPipe],
  host: { class: 'block' },
  templateUrl: './summary-tile.component.html',
})
export class SummaryTile {
  readonly label = input.required<string>();
  readonly value = input.required<Money | number>();
  readonly previous = input.required<Money | number>();
  /** A rise is bad news (owed, no-shows, expenses …). */
  readonly lowerIsBetter = input(false);

  protected readonly text = MONTH_SUMMARY_TEXT;
  protected readonly isMoney = computed(() => typeof this.value() !== 'number');
  protected readonly change = computed(() => monthChange(this.value(), this.previous()));
  protected readonly tone = computed(() => {
    const c = this.change();
    if (!c) return 'text-on-surface-variant';
    const good = this.lowerIsBetter() ? c < 0 : c > 0;
    return good ? 'text-green-700 dark:text-green-400' : 'text-error';
  });
}
