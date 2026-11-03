import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TONE_DOT_CLASSES } from '@constants/status-tones.constants';
import { VISIT_TIMING_FILTER_TEXT } from '@constants/clinic/visit-timing-filter.constants';
import { VisitTiming } from '@enums/clinic/visit-timing.enum';
import { EnumService } from '@services/data/enum.service';

/**
 * `<app-visit-timing-filter [(value)]="timing" />` — All · Coming · Today · Past · Missed, each with its colour dot
 * (the same colours as the visit rows). `null` is All.
 */
@Component({
  selector: 'app-visit-timing-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonToggleModule],
  templateUrl: './visit-timing-filter.component.html',
})
export class VisitTimingFilter {
  readonly value = model<VisitTiming | null>(null);

  private readonly enums = inject(EnumService);
  protected readonly text = VISIT_TIMING_FILTER_TEXT;
  /** Re-read once the enum catalog (labels) has loaded. */
  protected readonly options = computed(() => {
    this.enums.loaded();
    return Object.values(VisitTiming).map((timing) => ({
      value: timing,
      label: this.enums.label('VisitTiming', timing),
      dot: TONE_DOT_CLASSES[this.enums.tone('VisitTiming', timing)],
    }));
  });
}
