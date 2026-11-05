import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusTone } from '@enums/ui/status-tone.enum';

/**
 * A determinate bar for real progress (how much of an invoice is paid, how far a plan has come). It fills in from
 * the left when it appears, slides to new values, and a sheen runs over it while `active`. The percentage is
 * written next to it for screen readers and when `showValue` is on, so colour is never the only signal.
 */
@Component({
  selector: 'ui-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBar {
  /** 0–100; values outside are clamped. */
  readonly value = input.required<number>();
  readonly label = input<string>('');
  readonly tone = input<StatusTone | `${StatusTone}`>(StatusTone.Blue);
  readonly showValue = input(false);
  /** Work still going on: a sheen runs over the filled part. */
  readonly active = input(false);
  readonly height = input(6);

  protected readonly percent = computed(() =>
    Math.round(Math.min(100, Math.max(0, this.value() || 0))),
  );
}
