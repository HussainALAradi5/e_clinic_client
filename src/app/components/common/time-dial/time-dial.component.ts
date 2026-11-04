import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { TIME_FIELD_TEXT, TIME_MINUTE_STEP } from '@constants/ui/time-field.constants';
import { ClockTime } from '@interfaces/ui/clock-time.interface';

/** Dial geometry (SVG user units). */
const CENTRE = 120;
const RADIUS = 92;

/**
 * Android-style clock dial: a big "9:05" header (tap the hours or minutes to switch), AM / PM toggles, and a round
 * face with the hand. Picking an hour moves on to the minutes, as on Android.
 */
@Component({
  selector: 'ui-time-dial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-dial.component.html',
})
export class TimeDial {
  readonly time = model.required<ClockTime>();

  protected readonly text = TIME_FIELD_TEXT;
  protected readonly centre = CENTRE;
  protected readonly mode = signal<'hour' | 'minute'>('hour');

  /** The 12 marks of the face: hours 12, 1…11 or minutes 00, 05…55, with their positions. */
  protected readonly marks = computed(() =>
    Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const value = this.mode() === 'hour' ? (i === 0 ? 12 : i) : i * TIME_MINUTE_STEP;
      return { value, x: CENTRE + RADIUS * Math.cos(angle), y: CENTRE + RADIUS * Math.sin(angle) };
    }),
  );

  /** Where the hand points. */
  protected readonly hand = computed(() => {
    const t = this.time();
    const step = this.mode() === 'hour' ? t.hour % 12 : t.minute / TIME_MINUTE_STEP;
    const angle = (step * 30 - 90) * (Math.PI / 180);
    return { x: CENTRE + RADIUS * Math.cos(angle), y: CENTRE + RADIUS * Math.sin(angle) };
  });

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  protected isSelected(value: number): boolean {
    const t = this.time();
    return this.mode() === 'hour' ? t.hour === value : t.minute === value;
  }

  protected pick(value: number): void {
    if (this.mode() === 'hour') {
      this.time.update((t) => ({ ...t, hour: value }));
      this.mode.set('minute');
    } else {
      this.time.update((t) => ({ ...t, minute: value }));
    }
  }

  protected setPm(pm: boolean): void {
    this.time.update((t) => ({ ...t, pm }));
  }
}
