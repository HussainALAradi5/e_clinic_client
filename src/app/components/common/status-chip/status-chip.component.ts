import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TONE_CLASSES } from '@constants/status-tones.constants';
import { EnumService } from '@services/data/enum.service';

/** `<ui-status enum="GenericStatus" [value]="row.status" />` — coloured chip for any enum value, text always shown (WCAG). */
@Component({
  selector: 'ui-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  templateUrl: './status-chip.component.html',
})
export class StatusChip {
  readonly value = input.required<string | number | null | undefined>();
  readonly enum = input.required<string>();
  /** Text to show instead of the enum's own label, when the server already sent the exact wording. */
  readonly text = input<string | null>(null);

  private readonly enums = inject(EnumService);
  protected readonly label = computed(
    () => this.text() ?? this.enums.label(this.enum(), this.value()),
  );
  protected readonly classes = computed(
    () => TONE_CLASSES[this.enums.tone(this.enum(), this.value())],
  );
}
