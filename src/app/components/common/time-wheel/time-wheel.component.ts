import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  model,
  viewChildren,
} from '@angular/core';
import { TIME_FIELD_TEXT, TIME_MINUTE_STEP } from '@constants/ui/time-field.constants';
import { ClockTime } from '@interfaces/ui/clock-time.interface';

/** Height of one wheel row in px (matches h-10 in the template). */
const ROW = 40;

/**
 * iPhone-style time wheels: hours, minutes and AM / PM columns that scroll and snap; the row in the middle band is
 * the value. Tapping a row picks it too.
 */
@Component({
  selector: 'ui-time-wheel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-wheel.component.html',
})
export class TimeWheel {
  readonly time = model.required<ClockTime>();

  protected readonly text = TIME_FIELD_TEXT;
  protected readonly hours = Array.from({ length: 12 }, (_, i) => i + 1);
  protected readonly minutes = Array.from(
    { length: 60 / TIME_MINUTE_STEP },
    (_, i) => i * TIME_MINUTE_STEP,
  );
  protected readonly periods = [false, true];
  private readonly columns = viewChildren<ElementRef<HTMLElement>>('column');

  constructor() {
    afterNextRender(() => this.centre());
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  protected pickHour(hour: number): void {
    this.time.update((t) => ({ ...t, hour }));
    this.centre();
  }

  protected pickMinute(minute: number): void {
    this.time.update((t) => ({ ...t, minute }));
    this.centre();
  }

  protected pickPeriod(pm: boolean): void {
    this.time.update((t) => ({ ...t, pm }));
    this.centre();
  }

  /** A column stopped scrolling: its middle row becomes the value. */
  protected settle(column: 'hour' | 'minute' | 'pm', element: HTMLElement): void {
    const index = Math.round(element.scrollTop / ROW);
    if (column === 'hour') {
      this.time.update((t) => ({ ...t, hour: this.hours[Math.min(index, 11)] }));
    } else if (column === 'minute') {
      this.time.update((t) => ({
        ...t,
        minute: this.minutes[Math.min(index, this.minutes.length - 1)],
      }));
    } else {
      this.time.update((t) => ({ ...t, pm: index >= 1 }));
    }
  }

  /** Scrolls each column so the chosen row sits in the middle band. */
  private centre(): void {
    const t = this.time();
    const rows = [
      this.hours.indexOf(t.hour),
      Math.round(t.minute / TIME_MINUTE_STEP),
      t.pm ? 1 : 0,
    ];
    this.columns().forEach((c, i) =>
      c.nativeElement.scrollTo({ top: rows[i] * ROW, behavior: 'smooth' }),
    );
  }
}
