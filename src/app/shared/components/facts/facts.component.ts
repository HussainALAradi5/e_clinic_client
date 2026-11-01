import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { Flag } from '../flag/flag.component';
import { StatusChip } from '../status-chip/status-chip.component';

/**
 * Label / value list of a detail card: `<ui-facts [items]="[{ label: 'Phone', value: p.phone }]" />`.
 * Empty values show an em dash; `mono` for codes and numbers, `enum` for a coloured badge, `flag` for a country badge.
 */
@Component({
  selector: 'ui-facts',
  imports: [Flag, StatusChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './facts.component.html',
})
export class Facts {
  readonly items = input.required<Fact[]>();
}
