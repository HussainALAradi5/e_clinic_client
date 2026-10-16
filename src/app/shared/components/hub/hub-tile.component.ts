import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IconBadge } from './icon-badge.component';

/**
 * One tile of a hub grid. Renders a router link (`link`), an external link (`href`) or plain content (neither).
 * `row` is a compact one-line tile; `card` stacks icon, title and description; `featured` is the large mint tile.
 */
@Component({
  selector: 'ui-hub-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet, MatIconModule, IconBadge],
  host: {
    class: 'block',
    '[class.featured-host]': "layout() === 'featured'",
    '[class.wide-host]': 'wide()',
  },
  templateUrl: './hub-tile.component.html',
})
export class HubTile {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string | null | undefined>(null);
  readonly link = input<string | null>(null);
  readonly href = input<string | null>(null);
  /** Opens `href` in a new tab (maps, WhatsApp). */
  readonly external = input(false);
  readonly layout = input<'row' | 'card' | 'featured'>('row');
  /** Spans the whole grid row on wide screens, laid out as one line (e.g. to close a grid). */
  readonly wide = input(false);
}
