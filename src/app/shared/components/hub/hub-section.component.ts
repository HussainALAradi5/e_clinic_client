import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/** A titled block of hub tiles laid out in a responsive grid (`columns` on wide screens). */
@Component({
  selector: 'ui-hub-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  host: { class: 'block' },
  templateUrl: './hub-section.component.html',
})
export class HubSection {
  readonly title = input<string | null>(null);
  readonly description = input<string | null | undefined>(null);
  /** Makes the group heading a link (e.g. to the group's hub page). */
  readonly link = input<string | null | undefined>(null);
  /** `page` for a page section (large heading), `group` for a group inside a page. */
  readonly size = input<'page' | 'group'>('group');
  readonly columns = input<2 | 3>(3);
}
