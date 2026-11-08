import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { COLLAPSE_ID_PREFIX } from '@constants/common/collapse.constants';

let collapseCount = 0;

/** `<ui-collapse label="More" [(expanded)]="open">content</ui-collapse>` — animated show / hide of projected content. */
@Component({
  selector: 'ui-collapse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: { class: 'block min-w-0' },
  templateUrl: './collapse.component.html',
  styleUrl: './collapse.component.scss',
})
export class Collapse {
  readonly label = input.required<string>();
  readonly expanded = model(false);

  private readonly id = `${COLLAPSE_ID_PREFIX}${++collapseCount}`;
  protected readonly headerId = `${this.id}-header`;
  protected readonly panelId = `${this.id}-panel`;

  protected toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }
}
