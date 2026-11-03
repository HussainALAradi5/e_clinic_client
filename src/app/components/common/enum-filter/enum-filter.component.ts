import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ENUM_FILTER_TEXT } from '@constants/common/enum-filter.constants';
import { TONE_DOT_CLASSES } from '@constants/status-tones.constants';
import { EnumService } from '@services/data/enum.service';

/**
 * `<ui-enum-filter enum="VisitTiming" label="Which visits" [(value)]="timing" />` — All plus each value of an enum
 * (labels from the server's catalog), each with the colour dot its badge wears. `[values]` limits / orders the
 * choices; `null` is All. Used for visit timing, payment state, paid by and result type.
 */
@Component({
  selector: 'ui-enum-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonToggleModule],
  templateUrl: './enum-filter.component.html',
})
export class EnumFilter {
  readonly enum = input.required<string>();
  /** Accessible name of the group, e.g. "Which visits". */
  readonly label = input.required<string>();
  /** Only these values, in this order (default: every value of the enum). */
  readonly values = input<readonly string[] | null>(null);
  readonly value = model<string | null>(null);

  private readonly enums = inject(EnumService);
  protected readonly text = ENUM_FILTER_TEXT;
  /** Re-read once the enum catalog has loaded. */
  protected readonly options = computed(() => {
    this.enums.loaded();
    const values = this.values() ?? this.enums.options(this.enum()).map((o) => String(o.value));
    return values.map((value) => ({
      value,
      label: this.enums.label(this.enum(), value),
      dot: TONE_DOT_CLASSES[this.enums.tone(this.enum(), value)],
    }));
  });
}
