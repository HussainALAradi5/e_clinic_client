import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { statusTone, TONE_CLASSES } from '@shared/constants/status-tones.constants';
import { EnumService } from '@shared/services/data/enum.service';

/** `<ui-status enum="GenericStatus" [value]="row.status" />` — coloured chip, text always shown (WCAG). */
@Component({
  selector: 'ui-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  templateUrl: './status-chip.component.html',
})
export class StatusChip {
  readonly value = input.required<string | number | null | undefined>();
  readonly enum = input.required<string>();

  private readonly enums = inject(EnumService);
  protected readonly label = computed(() => this.enums.label(this.enum(), this.value()));
  protected readonly classes = computed(
    () => TONE_CLASSES[statusTone(this.enum(), this.value()?.toString())],
  );
}
