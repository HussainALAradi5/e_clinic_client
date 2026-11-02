import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** An icon in a rounded square: `soft` (mint) for lists, `solid` (primary) for the featured item. */
@Component({
  selector: 'ui-icon-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: {
    class: 'icon-badge',
    '[class.icon-badge-solid]': "tone() === 'solid'",
    '[class.icon-badge-lg]': "size() === 'lg'",
    'aria-hidden': 'true',
  },
  template: '<mat-icon>{{ icon() }}</mat-icon>',
})
export class IconBadge {
  readonly icon = input.required<string>();
  readonly tone = input<'soft' | 'solid'>('soft');
  readonly size = input<'md' | 'lg'>('md');
}
