import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Fact } from '@shared/interfaces/ui/fact.interface';

/**
 * Label / value list of a detail card: `<ui-facts [items]="[{ label: 'Phone', value: p.phone }]" />`.
 * Empty values show an em dash; `mono` for codes and numbers.
 */
@Component({
  selector: 'ui-facts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './facts.component.html',
})
export class Facts {
  readonly items = input.required<Fact[]>();
}
