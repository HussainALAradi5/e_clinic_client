import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NavGroup } from '@interfaces/ui/nav-group.interface';
import { HubSection } from './hub-section.component';
import { HubTile } from './hub-tile.component';

/** Menu groups as hub sections of link tiles (dashboard, module hub pages). */
@Component({
  selector: 'ui-hub-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HubSection, HubTile],
  host: { class: 'flex flex-col gap-8' },
  templateUrl: './hub-nav.component.html',
})
export class HubNav {
  readonly groups = input.required<NavGroup[]>();
  /** Show each group's heading (off on a hub page, whose header already names the group). */
  readonly headings = input(true);
  readonly layout = input<'row' | 'card'>('row');
  readonly columns = input<2 | 3>(2);
}
